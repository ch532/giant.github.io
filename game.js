const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');
canvas.width = 800;
canvas.height = 600;

const bridge = window.playgamaBridge;

let keys = {};

let gameState = {
    player: { x: 50, y: 300, size: 20, speed: 5, gold: 0 },
    currentLevel: 1,
    isInitialized: false,
    isPaused: false,
    hasSpeedBoost: false
};

function generateLevel(num) {
    const level = {
        color: `hsl(${(num * 40) % 360}, 30%, 20%)`,
        walls: [], items: [], enemies: []
    };
    const wallCount = 3 + Math.min(num, 10);
    for (let i = 0; i < wallCount; i++) {
        level.walls.push({ x: 150 + (Math.random() * 500), y: Math.random() * 500, w: 30, h: 150 });
    }
    for (let i = 0; i < 3; i++) {
        level.items.push({ x: 200 + (Math.random() * 500), y: 50 + (Math.random() * 500), collected: false });
    }
    return level;
}

let currentLevelData = generateLevel(1);

// Mobile Touch Control Variables
let isTouching = false;
let touchX = 0;
let touchY = 0;

async function syncLeaderboard() {
    if (bridge && bridge.leaderboard && bridge.leaderboard.isSupported()) {
        try {
            await bridge.leaderboard.setScore({ 
                leaderboardName: 'main_leaderboard', 
                score: gameState.player.gold 
            });
        } catch (e) { console.error(e); }
    }
}

async function buySpeedBoost() {
    if (bridge && bridge.payments && bridge.payments.isSupported()) {
        try {
            const status = await bridge.payments.purchase({ id: 'speed_boost_id' });
            if (status === 'completed') {
                gameState.player.speed = 8;
                gameState.hasSpeedBoost = true;
                saveGame();
            }
        } catch (e) { console.error(e); }
    }
}

async function initGame() {
    if (bridge) {
        await bridge.initialize();
        const saved = await bridge.storage.get('adv_data_final');
        if (saved) {
            gameState = { ...gameState, ...saved };
            currentLevelData = generateLevel(gameState.currentLevel);
        }
    }
    gameState.isInitialized = true;
    gameLoop();
}

async function saveGame() {
    if (bridge && bridge.storage) {
        await bridge.storage.set('adv_data_final', gameState);
    }
    await syncLeaderboard();
}

async function nextLevel() {
    if (gameState.currentLevel >= 150) return alert("You Win!");
    gameState.isPaused = true;
    gameState.currentLevel++;
    currentLevelData = generateLevel(gameState.currentLevel);
    gameState.player.x = 30;
    
    if (bridge && bridge.ads) {
        try {
            await bridge.ads.showInterstitial();
        } catch(err) { console.warn(err); }
    }
    
    keys = {}; 
    isTouching = false;
    await saveGame();
    gameState.isPaused = false;
}

function update() {
    if (gameState.isPaused || !gameState.isInitialized) return;
    let nextX = gameState.player.x;
    let nextY = gameState.player.y;

    // Desktop Keyboard Movement logic
    if (keys['w']) nextY -= gameState.player.speed;
    if (keys['s']) nextY += gameState.player.speed;
    if (keys['a']) nextX -= gameState.player.speed;
    if (keys['d']) nextX += gameState.player.speed;

    // Mobile Navigation Logic (Move towards touch point)
    if (isTouching) {
        const dx = touchX - (gameState.player.x + 10);
        const dy = touchY - (gameState.player.y + 10);
        const distance = Math.sqrt(dx * dx + dy * dy);

        if (distance > 5) { // Stop vibrating when close enough to pointer position
            nextX += (dx / distance) * gameState.player.speed;
            nextY += (dy / distance) * gameState.player.speed;
        }
    }

    let canMove = true;
    currentLevelData.walls.forEach(w => {
        if (nextX < w.x + w.w && nextX + 20 > w.x && nextY < w.y + w.h && nextY + 20 > w.y) canMove = false;
    });

    if (canMove) {
        gameState.player.x = nextX;
        gameState.player.y = nextY;
    }
    if (gameState.player.x > canvas.width) nextLevel();
}

function draw() {
    ctx.fillStyle = currentLevelData.color;
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    ctx.fillStyle = "#111";
    currentLevelData.walls.forEach(w => ctx.fillRect(w.x, w.y, w.w, w.h));
    ctx.fillStyle = "gold";
    currentLevelData.items.forEach(i => { if(!i.collected) ctx.fillRect(i.x, i.y, 10, 10) });
    ctx.fillStyle = "cyan";
    ctx.fillRect(gameState.player.x, gameState.player.y, 20, 20);
    ctx.fillStyle = "white";
    ctx.font = "16px Arial";
    ctx.fillText(`Level: ${gameState.currentLevel} / 150 | Gold: ${gameState.player.gold}`, 20, 30);
    ctx.fillStyle = "#27ae60";
    ctx.fillRect(650, 20, 130, 40);
    ctx.fillStyle = "white";
    ctx.fillText("BUY SPEED", 675, 45);
}

// Global Event Listeners
window.addEventListener('keydown', e => keys[e.key.toLowerCase()] = true);
window.addEventListener('keyup', e => keys[e.key.toLowerCase()] = false);

// Unified Mouse & Touch Screen Handler Logic
function handlePointerDown(clientX, clientY) {
    const rect = canvas.getBoundingClientRect();
    const clickX = (clientX - rect.left) * (canvas.width / rect.width);
    const clickY = (clientY - rect.top) * (canvas.height / rect.height);

    if (clickX > 650 && clickX < 780 && clickY > 20 && clickY < 60) {
        buySpeedBoost();
    } else {
        isTouching = true;
        touchX = clickX;
        touchY = clickY;
    }
}

function handlePointerMove(clientX, clientY) {
    if (!isTouching) return;
    const rect = canvas.getBoundingClientRect();
    touchX = (clientX - rect.left) * (canvas.width / rect.width);
    touchY = (clientY - rect.top) * (canvas.height / rect.height);
}

// Mouse Listeners
canvas.addEventListener('mousedown', e => handlePointerDown(e.clientX, e.clientY));
window.addEventListener('mousemove', e => handlePointerMove(e.clientX, e.clientY));
window.addEventListener('mouseup', () => isTouching = false);

// Touch Interface Action Hook listeners
canvas.addEventListener('touchstart', e => {
    e.preventDefault();
    handlePointerDown(e.touches[0].clientX, e.touches[0].clientY);
}, { passive: false });

canvas.addEventListener('touchmove', e => {
    e.preventDefault();
    handlePointerMove(e.touches[0].clientX, e.touches[0].clientY);
}, { passive: false });

window.addEventListener('touchend', () => isTouching = false);

function gameLoop() {
    update();
    draw();
    requestAnimationFrame(gameLoop);
}

initGame();
