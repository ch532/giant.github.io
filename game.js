const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');
canvas.width = 800;
canvas.height = 600;

// Correctly targeting the window.bridge namespace
const bridge = window.bridge || null;
const LEADERBOARD_ID = "main_leaderboard"; 
const STORAGE_KEY = "adv_data_final"; 

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

// Define explicit button objects with exact drawing and collision metrics
const buttons = {
    restart:    { x: 320, y: 15, w: 85, h: 35, label: "RESTART +🪙", color: "#e67e22" },
    leader:     { x: 415, y: 15, w: 85, h: 35, label: "LEADER",     color: "#8e44ad" },
    share:      { x: 510, y: 15, w: 85, h: 35, label: "SHARE 📢",   color: "#00a8ff" },
    fullscreen: { x: 605, y: 15, w: 85, h: 35, label: "FULLSCREEN", color: "#2980b9" },
    buySpeed:   { x: 700, y: 15, w: 85, h: 35, label: "BUY SPEED",  color: "#27ae60" }
};

function generateLevel(num) {
    const level = {
        color: `hsl(${(num * 40) % 360}, 30%, 20%)`,
        walls: [], 
        items: [], 
        enemies: []
    };

    const wallCount = 3 + Math.min(num, 7);
    for (let i = 0; i < wallCount; i++) {
        level.walls.push({ 
            x: 180 + (i * 65) + (Math.random() * 15), 
            y: Math.random() * 350, 
            w: 25, 
            h: 180 
        });
    }

    const itemCount = 2; 
    for (let i = 0; i < itemCount; i++) {
        level.items.push({ 
            x: 200 + (Math.random() * 450), 
            y: 50 + (Math.random() * 500), 
            size: 12,
            collected: false 
        });
    }

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

function syncLeaderboard() {
    if (bridge && bridge.leaderboards && typeof bridge.leaderboards.setScore === 'function') {
        bridge.leaderboards.setScore(LEADERBOARD_ID, gameState.player.gold)
            .then(() => { console.log("Score submitted successfully"); })
            .catch(error => { console.error("Error submitting score:", error); });
    }
}

function showLeaderboardPopup() {
    if (bridge && bridge.leaderboards && typeof bridge.leaderboards.showNativePopup === 'function') {
        bridge.leaderboards.showNativePopup(LEADERBOARD_ID)
            .then(() => console.log("Popup shown"))
            .catch(error => console.error("Error showing popup:", error));
    }
}

function shareGameProgress() {
    if (bridge && bridge.social && typeof bridge.social.share === 'function') {
        bridge.social.share({ 
            message: `Can you beat my score? I am currently on Level ${gameState.currentLevel} with ${gameState.player.gold} Gold in Connect Gold! 🪙`, 
            image: "https://connectgold.sbs/icon.jpg", 
            link: window.location.href 
        })
        .then(() => console.log("Share dialogue window closed successfully"))
        .catch(error => console.error("Social Share error interaction:", error));
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

function handleRestartWithReward() {
    gameState.isPaused = true;

    if (bridge && bridge.advertisement && typeof bridge.advertisement.showRewarded === 'function') {
        bridge.advertisement.showRewarded('extra_gold')
            .then((rewarded) => {
                if (rewarded) {
                    gameState.player.gold += 5;
                    console.log("User earned reward: +5 Gold!");
                } else {
                    console.log("No reward: Ad skipped");
                }
                currentLevelData = generateLevel(gameState.currentLevel);
                resetPlayerPosition();
                saveGame();
                gameState.isPaused = false;
            })
            .catch(err => {
                console.error("Rewarded ad error:", err);
                currentLevelData = generateLevel(gameState.currentLevel);
                resetPlayerPosition();
                gameState.isPaused = false;
            });
    } else {
        currentLevelData = generateLevel(gameState.currentLevel);
        resetPlayerPosition();
        gameState.isPaused = false;
    }
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
    if (bridge && bridge.storage && typeof bridge.storage.get === 'function') {
        try {
            if (bridge.platform) console.log("Connected to Platform Environment ID:", bridge.platform.id);
            
            bridge.storage.get(STORAGE_KEY, "platform_internal")
                .then((data) => {
                    if (data) {
                        gameState = { ...gameState, ...data };
                        currentLevelData = generateLevel(gameState.currentLevel);
                        if (gameState.hasSpeedBoost) gameState.player.speed = 8;
                        console.log("Cloud Save Data Loaded Successfully", data);
                    }
                    gameState.isInitialized = true;
                    gameLoop();
                })
                .catch(error => {
                    console.error("Error loading cloud data:", error);
                    gameState.isInitialized = true;
                    gameLoop(); 
                });
            return;
        } catch (e) { console.warn("SDK storage read setup exception caught:", e); }
    }
    gameState.isInitialized = true;
    gameLoop();
}

function saveGame() {
    if (bridge && bridge.storage && typeof bridge.storage.set === 'function') {
        bridge.storage.set(STORAGE_KEY, gameState, "platform_internal")
            .then(() => { console.log("Data saved safely to Playgama Cloud infrastructure"); })
            .catch(error => { console.error("Error pushing data to cloud storage:", error); });
    }
    syncLeaderboard();
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
    
    if (bridge && bridge.advertisement && typeof bridge.advertisement.showInterstitial === 'function') {
        try { 
            await bridge.advertisement.showInterstitial('next_level'); 
        } catch(err) { 
            console.warn("Interstitial display skipped/failed:", err); 
        }
    }
    
    keys = {}; 
    saveGame(); 
    gameState.isPaused = false;
}

function update() {
    if (gameState.isPaused || !gameState.isInitialized) return;
    
    let nextX = gameState.player.x;
    let nextY = gameState.player.y;

    portal.pulse += 0.05 * portal.pulseDirection;
    if (portal.pulse > 1 || portal.pulse < 0) portal.pulseDirection *= -1;

    if (keys['w'] || keys['arrowup']) nextY -= gameState.player.speed;
    if (keys['s'] || keys['arrowdown']) nextY += gameState.player.speed;
    if (keys['a'] || keys['arrowleft']) nextX -= gameState.player.speed;
    if (keys['d'] || keys['arrowright']) nextX += gameState.player.speed;

    if (isTouching) {
        const dx = touchX - (gameState.player.x + 10);
        const dy = touchY - (gameState.player.y + 10);
        const distance = Math.sqrt(dx * dx + dy * dy);
        
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
    
    ctx.fillStyle = "white";
    ctx.font = "bold 16px Arial";
    ctx.fillText(`Level: ${gameState.currentLevel} / 150`, 20, 32);
    ctx.fillText(`Gold: ${gameState.player.gold}`, 160, 32);
    
    ctx.font = "bold 11px Arial";
    
    // Dynamically draw the buttons using the structured collection objects
    Object.keys(buttons).forEach(key => {
        const b = buttons[key];
        ctx.fillStyle = b.color;
        ctx.fillRect(b.x, b.y, b.w, b.h);
        ctx.fillStyle = "white";
        
        // Custom text centering adjustments
        let offset = 6;
        if(key === 'restart') offset = 6;
        if(key === 'leader') offset = 18;
        if(key === 'share') offset = 16;
        if(key === 'fullscreen') offset = 6;
        if(key === 'buySpeed') offset = 11;
        
        ctx.fillText(b.label, b.x + offset, b.y + 21);
    });
}

window.addEventListener('keydown', e => keys[e.key.toLowerCase()] = true);
window.addEventListener('keyup', e => keys[e.key.toLowerCase()] = false);

// FIXED: Flawless absolute scalar coordinate mapping function
function getMappedCoordinates(clientX, clientY) {
    const rect = canvas.getBoundingClientRect();
    
    // Avoid dividing by zero if layout renders cleanly at 0 dimensions initially
    const scaleX = rect.width > 0 ? canvas.width / rect.width : 1;
    const scaleY = rect.height > 0 ? canvas.height / rect.height : 1;
    
    return {
        x: (clientX - rect.left) * scaleX,
        y: (clientY - rect.top) * scaleY
    };
}

// FIXED: Evaluates the crisp interaction boundary hits explicitly
function handlePointerAction(clientX, clientY, isPressing) {
    const pos = getMappedCoordinates(clientX, clientY);

    if (isPressing) {
        // Loop through explicit button bounding profiles
        let buttonClicked = false;
        
        Object.keys(buttons).forEach(key => {
            const b = buttons[key];
            if (pos.x >= b.x && pos.x <= b.x + b.w && pos.y >= b.y && pos.y <= b.y + b.h) {
                buttonClicked = true;
                if (key === 'buySpeed') buySpeedBoost();
                if (key === 'fullscreen') toggleFullscreen();
                if (key === 'share') shareGameProgress();
                if (key === 'leader') showLeaderboardPopup();
                if (key === 'restart') handleRestartWithReward();
            }
        });

        // CRITICAL FIX: Only activate player movement dragging if a header UI button wasn't clicked
        if (!buttonClicked) {
            isTouching = true;
            touchX = pos.x;
            touchY = pos.y;
        }
    }
}

// Global Event Routing Hooks
canvas.addEventListener('mousedown', e => handlePointerAction(e.clientX, e.clientY, true));
canvas.addEventListener('mousemove', e => { if (isTouching) handlePointerAction(e.clientX, e.clientY, true); });
window.addEventListener('mouseup', () => isTouching = false);

canvas.addEventListener('touchstart', e => {
    // Prevent default mobile scaling/scrolling actions
    if(e.cancelable) e.preventDefault(); 
    handlePointerAction(e.touches[0].clientX, e.touches[0].clientY, true);
}, { passive: false });

canvas.addEventListener('touchmove', e => {
    if(e.cancelable) e.preventDefault();
    handlePointerAction(e.touches[0].clientX, e.touches[0].clientY, true);
}, { passive: false });

window.addEventListener('touchend', () => isTouching = false);

function gameLoop() {
    update();
    draw();
    requestAnimationFrame(gameLoop);
}

initGame();
