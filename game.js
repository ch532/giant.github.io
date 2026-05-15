const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');
canvas.width = 800;
canvas.height = 600;

const bridge = window.playgamaBridge;

// 1. INPUT DEFINITION MUST BE AT THE TOP OR IT CRASHES
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
    // Check if running inside Playgama framework environment
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
    await saveGame();
    gameState.isPaused = false;
}

function update() {
    if (gameState.isPaused || !gameState.isInitialized) return;
    let nextX = gameState.player.x;
    let nextY = gameState.player.y;
    if (keys['w']) nextY -= gameState.player.speed;
    if (keys['s']) nextY += gameState.player.speed;
    if (keys['a']) nextX -= gameState.player.speed;
    if (keys['d']) nextX += gameState.player.speed;

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

window.addEventListener('keydown', e => keys[e.key.toLowerCase()] = true);
window.addEventListener('keyup', e => keys[e.key.toLowerCase()] = false);

canvas.addEventListener('mousedown', (e) => {
    const rect = canvas.getBoundingClientRect();
    const mouseX = e.clientX - rect.left;
    const mouseY = e.clientY - rect.top;
    if (mouseX > 650 && mouseX < 780 && mouseY > 20 && mouseY < 60) buySpeedBoost();
});

function gameLoop() {
    update();
    draw();
    requestAnimationFrame(gameLoop);
}

initGame();
