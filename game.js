const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');
canvas.width = 800;
canvas.height = 600;

const bridge = window.playgamaBridge || null;

let keys = {};
let isTouching = false;
let touchX = 0;
let touchY = 0;

let gameState = {
    player: { x: 50, y: 300, size: 20, speed: 5, gold: 0 },
    currentLevel: 1,
    isInitialized: false,
    isPaused: false,
    hasSpeedBoost: false
};

const portal = {
    x: 730,
    y: 270,
    width: 40,
    height: 60,
    pulse: 0,
    pulseDirection: 1
};

function generateLevel(num) {
    const level = {
        color: `hsl(${(num * 40) % 360}, 30%, 20%)`,
        walls: [], 
        items: [], 
        enemies: []
    };

    // 1. Generate Walls
    const wallCount = 3 + Math.min(num, 7);
    for (let i = 0; i < wallCount; i++) {
        level.walls.push({ 
            x: 180 + (i * 65) + (Math.random() * 15), 
            y: Math.random() * 350, 
            w: 25, 
            h: 180 
        });
    }

    // 2. Generate Balanced Items (Scarce Coins)
    const itemCount = 2; 
    for (let i = 0; i < itemCount; i++) {
        level.items.push({ 
            x: 200 + (Math.random() * 450), 
            y: 50 + (Math.random() * 500), 
            size: 12,
            collected: false 
        });
    }

    // 3. MUCH HIGHER Enemy counts scaling aggressively up to 12 maximum enemies
    const enemyCount = 3 + Math.min(Math.floor(num / 2), 9); 
    const baseEnemySpeed = 2.5 + Math.min(num * 0.2, 7.5); 

    for (let i = 0; i < enemyCount; i++) {
        level.enemies.push({
            x: 220 + (Math.random() * 450),
            y: 50 + (Math.random() * 450),
            size: 16,
            vx: Math.random() > 0.5 ? baseEnemySpeed : -baseEnemySpeed,
            vy: Math.random() > 0.5 ? baseEnemySpeed : -baseEnemySpeed
        });
    }

    portal.y = 100 + (Math.random() * 400);
    return level;
}

let currentLevelData = generateLevel(1);

async function syncLeaderboard() {
    if (bridge && bridge.leaderboard && typeof bridge.leaderboard.isSupported === 'function' && bridge.leaderboard.isSupported()) {
        try {
            await bridge.leaderboard.setScore({ 
                leaderboardName: 'main_leaderboard', 
                score: gameState.player.gold 
            });
        } catch (e) { console.error(e); }
    }
}

async function buySpeedBoost() {
    if (bridge && bridge.payments && typeof bridge.payments.isSupported === 'function' && bridge.payments.isSupported()) {
        try {
            const status = await bridge.payments.purchase({ id: 'speed_boost_id' });
            if (status === 'completed') {
                gameState.player.speed = 8;
                gameState.hasSpeedBoost = true;
                saveGame();
            }
        } catch (e) { console.error(e); }
    } else {
        gameState.player.speed = 8;
        gameState.hasSpeedBoost = true;
        console.log("Fallback: Speed Boost Activated");
    }
}

function restartLevel() {
    // Generate fresh coordinates, items, and reset positioning for the current level
    currentLevelData = generateLevel(gameState.currentLevel);
    resetPlayerPosition();
}

function toggleFullscreen() {
    if (!document.fullscreenElement) {
        canvas.requestFullscreen().catch(err => {
            console.error(`Error enabling fullscreen: ${err.message}`);
        });
    } else {
        document.exitFullscreen();
    }
}

async function initGame() {
    if (bridge && typeof bridge.initialize === 'function') {
        try {
            await bridge.initialize();
            const saved = await bridge.storage.get('adv_data_final');
            if (saved) {
                gameState = { ...gameState, ...saved };
                currentLevelData = generateLevel(gameState.currentLevel);
                if (gameState.hasSpeedBoost) gameState.player.speed = 8;
            }
        } catch (e) { console.warn(e); }
    }
    gameState.isInitialized = true;
    gameLoop();
}

async function saveGame() {
    if (bridge && bridge.storage) {
        try { await bridge.storage.set('adv_data_final', gameState); } catch(e){}
    }
    await syncLeaderboard();
}

function resetPlayerPosition() {
    gameState.player.x = 40;
    gameState.player.y = 300;
    isTouching = false;
}

async function nextLevel() {
    if (gameState.currentLevel >= 150) return alert("Congratulations! You Beat All 150 Levels!");
    gameState.isPaused = true;
    gameState.currentLevel++;
    currentLevelData = generateLevel(gameState.currentLevel);
    resetPlayerPosition();
    
    if (bridge && bridge.ads) {
        try { await bridge.ads.showInterstitial(); } catch(err) { console.warn(err); }
    }
    
    keys = {}; 
    await saveGame();
    gameState.isPaused = false;
}

function update() {
    if (gameState.isPaused || !gameState.isInitialized) return;
    
    let nextX = gameState.player.x;
    let nextY = gameState.player.y;

    portal.pulse += 0.05 * portal.pulseDirection;
    if (portal.pulse > 1 || portal.pulse < 0) portal.pulseDirection *= -1;

    // 1. Keyboard Tracking Matrix
    if (keys['w'] || keys['arrowup']) nextY -= gameState.player.speed;
    if (keys['s'] || keys['arrowdown']) nextY += gameState.player.speed;
    if (keys['a'] || keys['arrowleft']) nextX -= gameState.player.speed;
    if (keys['d'] || keys['arrowright']) nextX += gameState.player.speed;

    // 2. High-Responsiveness Direct Touch Controller
    if (isTouching) {
        const dx = touchX - (gameState.player.x + 10);
        const dy = touchY - (gameState.player.y + 10);
        const distance = Math.sqrt(dx * dx + dy * dy);
        
        // Instant response movement multiplier
        if (distance > 2) {
            const moveStep = Math.min(distance, gameState.player.speed);
            nextX += (dx / distance) * moveStep;
            nextY += (dy / distance) * moveStep;
        }
    }

    if (nextX < 0) nextX = 0;
    if (nextX > canvas.width - 20) nextX = canvas.width - 20;
    if (nextY < 0) nextY = 0;
    if (nextY > canvas.height - 20) nextY = canvas.height - 20;

    let canMove = true;
    currentLevelData.walls.forEach(w => {
        if (nextX < w.x + w.w && nextX + 20 > w.x && nextY < w.y + w.h && nextY + 20 > w.y) canMove = false;
    });

    if (canMove) {
        gameState.player.x = nextX;
        gameState.player.y = nextY;
    }

    // Enemy Collisions
    currentLevelData.enemies.forEach(e => {
        e.x += e.vx;
        e.y += e.vy;

        if (e.x < 0 || e.x > canvas.width - e.size) e.vx *= -1;
        if (e.y < 0 || e.y > canvas.height - e.size) e.vy *= -1;

        currentLevelData.walls.forEach(w => {
            if (e.x < w.x + w.w && e.x + e.size > w.x && e.y < w.y + w.h && e.y + e.size > w.y) {
                e.vx *= -1;
                e.vy *= -1;
            }
        });

        if (gameState.player.x < e.x + e.size && gameState.player.x + 20 > e.x && 
            gameState.player.y < e.y + e.size && gameState.player.y + 20 > e.y) {
            resetPlayerPosition(); 
        }
    });

    // Gold Item Collisions
    currentLevelData.items.forEach(i => {
        if (!i.collected && gameState.player.x < i.x + i.size && gameState.player.x + 20 > i.x && 
            gameState.player.y < i.y + i.size && gameState.player.y + 20 > i.y) {
            i.collected = true;
            gameState.player.gold += 1;
            saveGame();
        }
    });

    if (gameState.player.x < portal.x + portal.width && gameState.player.x + 20 > portal.x &&
        gameState.player.y < portal.y + portal.height && gameState.player.y + 20 > portal.y) {
        nextLevel();
    }
}

function draw() {
    ctx.fillStyle = currentLevelData.color;
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    
    ctx.fillStyle = "#111";
    currentLevelData.walls.forEach(w => ctx.fillRect(w.x, w.y, w.w, w.h));
    
    ctx.fillStyle = "gold";
    currentLevelData.items.forEach(i => {
        if (!i.collected) {
            ctx.beginPath();
            ctx.arc(i.x + i.size/2, i.y + i.size/2, i.size/2, 0, Math.PI * 2);
            ctx.fill();
        }
    });
    
    ctx.fillStyle = "#ff4d4d";
    currentLevelData.enemies.forEach(e => ctx.fillRect(e.x, e.y, e.size, e.size));
    
    // Portal Archway
    ctx.save();
    ctx.shadowBlur = 10 + (portal.pulse * 15);
    ctx.shadowColor = "#00ffaa";
    ctx.fillStyle = "rgba(0, 255, 170, 0.8)";
    ctx.beginPath();
    ctx.roundRect(portal.x, portal.y, portal.width, portal.height, [20, 20, 0, 0]);
    ctx.fill();
    ctx.fillStyle = `rgba(255, 255, 255, ${0.3 + (portal.pulse * 0.4)})`;
    ctx.beginPath();
    ctx.roundRect(portal.x + 5, portal.y + 5, portal.width - 10, portal.height - 5, [15, 15, 0, 0]);
    ctx.fill();
    ctx.restore();

    ctx.fillStyle = "cyan";
    ctx.fillRect(gameState.player.x, gameState.player.y, 20, 20);
    
    // Dashboard Layout Text Panel
    ctx.fillStyle = "white";
    ctx.font = "bold 16px Arial";
    ctx.fillText(`Level: ${gameState.currentLevel} / 150`, 20, 32);
    ctx.fillText(`Gold: ${gameState.player.gold}`, 160, 32);
    
    ctx.font = "bold 12px Arial";
    
    // Green Button: BUY SPEED
    ctx.fillStyle = "#27ae60";
    ctx.fillRect(670, 15, 110, 35);
    ctx.fillStyle = "white";
    ctx.fillText("BUY SPEED", 693, 37);

    // Dark Blue Button: FULLSCREEN
    ctx.fillStyle = "#2980b9";
    ctx.fillRect(550, 15, 110, 35);
    ctx.fillStyle = "white";
    ctx.fillText("FULLSCREEN", 568, 37);

    // Light Orange/Red Button: RESTART
    ctx.fillStyle = "#e67e22";
    ctx.fillRect(430, 15, 110, 35);
    ctx.fillStyle = "white";
    ctx.fillText("RESTART", 460, 37);
}

window.addEventListener('keydown', e => keys[e.key.toLowerCase()] = true);
window.addEventListener('keyup', e => keys[e.key.toLowerCase()] = false);

function getMappedCoordinates(clientX, clientY) {
    const rect = canvas.getBoundingClientRect();
    return {
        x: (clientX - rect.left) * (canvas.width / rect.width),
        y: (clientY - rect.top) * (canvas.height / rect.height)
    };
}

function handlePointerAction(clientX, clientY, isPressing) {
    const pos = getMappedCoordinates(clientX, clientY);

    if (isPressing) {
        // UI Dashboard Top Row Button Bounds Matrix Intersections
        if (pos.y > 15 && pos.y < 50) {
            if (pos.x > 670 && pos.x < 780) { buySpeedBoost(); return; }
            if (pos.x > 550 && pos.x < 660) { toggleFullscreen(); return; }
            if (pos.x > 430 && pos.x < 540) { restartLevel(); return; }
        }
        isTouching = true;
        touchX = pos.x;
        touchY = pos.y;
    }
}

canvas.addEventListener('mousedown', e => handlePointerAction(e.clientX, e.clientY, true));
canvas.addEventListener('mousemove', e => { if (isTouching) handlePointerAction(e.clientX, e.clientY, true); });
window.addEventListener('mouseup', () => isTouching = false);

canvas.addEventListener('touchstart', e => {
    handlePointerAction(e.touches[0].clientX, e.touches[0].clientY, true);
});
canvas.addEventListener('touchmove', e => {
    handlePointerAction(e.touches[0].clientX, e.touches[0].clientY, true);
});
window.addEventListener('touchend', () => isTouching = false);

function gameLoop() {
    update();
    draw();
    requestAnimationFrame(gameLoop);
}

initGame();
