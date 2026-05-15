```javascript
const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');
canvas.width = 800;
canvas.height = 600;

// Target the official playgama bridge namespace
const bridge = window.bridge || null;
const LEADERBOARD_ID = "main_leaderboard"; 
const STORAGE_KEY = "adv_data_final"; 
const PURCHASE_PRODUCT_ID = "test_product"; 

let keys = {};
let isTouching = false;
let touchX = 0;
let touchY = 0;

let isAudioMuted = false;
let playerName = "Guest Player";
let playerId = null;
let isAdDisplaying = false;
let rewardEarnedPending = false;
let showInGameLeaderboard = false;
let leaderboardEntries = [];
let leaderboardLoadingState = "Idle";

let paymentStatusMessage = "";
let paymentMessageTimer = 0;

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

const buttons = {
    restart:    { x: 260, y: 15, w: 80, h: 35, label: "RESTART 🪙", color: "#e67e22" },
    leader:     { x: 350, y: 15, w: 80, h: 35, label: "RANKINGS",   color: "#8e44ad" },
    share:      { x: 440, y: 15, w: 80, h: 35, label: "SHARE 📢",   color: "#00a8ff" },
    rate:       { x: 530, y: 15, w: 80, h: 35, label: "RATE US ⭐", color: "#f1c40f" },
    fullscreen: { x: 620, y: 15, w: 80, h: 35, label: "FULLSCREEN", color: "#2980b9" },
    buySpeed:   { x: 710, y: 15, w: 80, h: 35, label: "BUY SPEED",  color: "#27ae60" }
};

function triggerStatusFeedback(msg) {
    paymentStatusMessage = msg;
    paymentMessageTimer = 180;
    console.log(`[Store Billing Alert]: ${msg}`);
}

function sendPlatformMessage(eventName) {
    if (bridge && bridge.platform && typeof bridge.platform.sendMessage === 'function') {
        bridge.platform.sendMessage(eventName);
        console.log(`[Playgama Event Tracked]: ${eventName}`);
    }
}

async function handlePlayerAuthorization() {
    if (!bridge || !bridge.player) return;
    try {
        if (typeof bridge.player.isAuthorizationSupported !== 'undefined' && bridge.player.isAuthorizationSupported) {
            if (bridge.player.isAuthorized) {
                playerName = bridge.player.name || "Authenticated Explorer";
                playerId = bridge.player.id || null;
            } else {
                let options = {};
                await bridge.player.authorize(options);
                playerName = bridge.player.name || "Authenticated Explorer";
                playerId = bridge.player.id || null;
            }
        }
    } catch (error) {
        console.error("Player authorization workflow encountered an error:", error);
    }
}

function saveGame() {
    if (!bridge || !bridge.storage) return;
    const preferredStorage = bridge.storage.defaultType;
    if (typeof bridge.storage.isAvailable === 'function' && bridge.storage.isAvailable(preferredStorage)) {
        bridge.storage.set(STORAGE_KEY, gameState)
            .then(() => { console.log(`Data saved successfully via [${preferredStorage}] pipeline.`); })
            .catch(error => { console.error("Error pushing data to cloud storage:", error); });
    } else {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(gameState));
    }
    syncLeaderboard();
}

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
        bridge.leaderboards.setScore(LEADERBOARD_ID, gameState.player.gold).catch(e => console.error(e));
    }
}

function handleLeaderboardClick() {
    if (!bridge || !bridge.leaderboards) return;
    const boardType = bridge.leaderboards.type; 
    if (boardType === 'native') {
        if (typeof bridge.leaderboards.showNativePopup === 'function') {
            bridge.leaderboards.showNativePopup(LEADERBOARD_ID).catch(error => console.error(error));
        }
    } else {
        toggleCustomInGameLeaderboard();
    }
}

function toggleCustomInGameLeaderboard() {
    showInGameLeaderboard = !showInGameLeaderboard;
    if (showInGameLeaderboard) {
        leaderboardLoadingState = "Loading";
        leaderboardEntries = [];
        if (typeof bridge.leaderboards.getEntries === 'function') {
            bridge.leaderboards.getEntries(LEADERBOARD_ID)
                .then(entries => {
                    leaderboardEntries = entries || [];
                    leaderboardLoadingState = "Success";
                })
                .catch(err => {
                    console.error(err);
                    leaderboardLoadingState = "Error";
                });
        } else {
            leaderboardLoadingState = "Error";
        }
    }
}

function shareGameProgress() {
    if (!bridge || !bridge.social || typeof bridge.social.isShareSupported === 'undefined' || !bridge.social.isShareSupported) return;

    let options = {};
    const platformId = (bridge.platform && bridge.platform.id) ? bridge.platform.id : 'unknown';
    const msgText = `Can you beat me? Level ${gameState.currentLevel} with ${gameState.player.gold} Gold in Connect Gold! 🪙`;
    const appUrl = window.location.href;
    const fallbackImage = "[https://connectgold.sbs/icon.jpg](https://connectgold.sbs/icon.jpg)";

    switch (platformId) {
        case 'vk': options = { link: appUrl }; break;
        case 'facebook': options = { image: fallbackImage, text: msgText }; break;
        case 'msn': options = { title: 'Play Connect Gold', image: fallbackImage, text: msgText }; break;
        default: options = { message: msgText, image: fallbackImage, link: appUrl }; break;
    }
    bridge.social.share(options).catch(error => console.error(error));
}

function promptPlatformRate() {
    if (bridge && bridge.social && typeof bridge.social.isRateSupported !== 'undefined' && bridge.social.isRateSupported) {
        bridge.social.rate().catch(err => console.error(err));
    }
}

function offerRetentionShortcuts() {
    if (!bridge || !bridge.social) return;
    if (typeof bridge.social.isAddToFavoritesSupported !== 'undefined' && bridge.social.isAddToFavoritesSupported) {
        bridge.social.addToFavorites().catch(e => console.error(e));
    }
    if (typeof bridge.social.isAddToHomeScreenSupported !== 'undefined' && bridge.social.isAddToHomeScreenSupported) {
        bridge.social.addToHomeScreen().catch(e => console.error(e));
    }
}

async function buySpeedBoost() {
    if (gameState.hasSpeedBoost) {
        triggerStatusFeedback("SPEED BOOST ALREADY ACTIVE FOR THIS LEVEL!");
        return;
    }

    if (bridge && bridge.payments && typeof bridge.payments.isSupported !== 'undefined' && bridge.payments.isSupported()) {
        try {
            triggerStatusFeedback("CONTACTING STORE INTEGRATION LAYER...");
            const purchaseResult = await bridge.payments.purchase(PURCHASE_PRODUCT_ID);
            console.log("Purchase window authorized signature:", purchaseResult);

            triggerStatusFeedback("VERIFYING TRANSACTION AND CONSUMING INVENTORY...");
            const consumeResult = await bridge.payments.consumePurchase(PURCHASE_PRODUCT_ID);
            console.log("Inventory cleanly consumed reference data:", consumeResult);

            applySpeedPerkState();
            triggerStatusFeedback("PURCHASE SUCCESSFUL! SPEED ACTIVE! ⚡");

        } catch (error) {
            console.error("Billing pipeline caught execution error traceback:", error);
            triggerStatusFeedback("TRANSACTION CANCELLED OR CONNECTION FAILURE.");
        }
    } else {
        applySpeedPerkState();
        triggerStatusFeedback("SANDBOX SIMULATION: GRANTED SPEED BOOST!");
    }
}

function applySpeedPerkState() {
    gameState.player.speed = 8;
    gameState.hasSpeedBoost = true;
    sendPlatformMessage("player_got_achievement"); 
    saveGame();
}

async function reconcileUnconsumedPurchases() {
    if (!bridge || !bridge.payments || typeof bridge.payments.getPurchases !== 'function') return;
    try {
        const purchases = await bridge.payments.getPurchases();
        if (purchases && purchases.length > 0) {
            for (const item of purchases) {
                if (item.id === PURCHASE_PRODUCT_ID) {
                    await bridge.payments.consumePurchase(item.id);
                    applySpeedPerkState();
                    triggerStatusFeedback("RESTORED PENDING LEVEL SPEED PERK ACCRUAL!");
                }
            }
        }
    } catch (err) {
        console.error(err);
    }
}

function handleRestartWithReward() {
    if (bridge && bridge.advertisement && typeof bridge.advertisement.isRewardedSupported !== 'undefined' && bridge.advertisement.isRewardedSupported) {
        gameState.isPaused = true;
        sendPlatformMessage("level_paused");
        rewardEarnedPending = false; 

        let placement = 'extra_gold_restart';
        bridge.advertisement.showRewarded(placement)
            .catch(err => {
                console.error(err);
                executeLevelRestart(false);
            });
    } else {
        executeLevelRestart(false);
    }
}

function executeLevelRestart(applyBonus) {
    if (applyBonus) gameState.player.gold += 5;
    gameState.player.speed = 5;
    gameState.hasSpeedBoost = false;

    currentLevelData = generateLevel(gameState.currentLevel);
    resetPlayerPosition();
    saveGame();
    
    isAdDisplaying = false;
    gameState.isPaused = false;
    showInGameLeaderboard = false; 
    sendPlatformMessage("level_resumed");
}

function toggleFullscreen() {
    if (!document.fullscreenElement) {
        canvas.requestFullscreen().catch(err => console.error(err));
    } else {
        document.exitFullscreen();
    }
}

function setupPlatformEventListeners() {
    if (!bridge || !bridge.platform || !bridge.EVENT_NAME) return;

    if (typeof bridge.platform.isAudioEnabled !== 'undefined') {
        isAudioMuted = !bridge.platform.isAudioEnabled;
    }
    bridge.platform.on(bridge.EVENT_NAME.AUDIO_STATE_CHANGED, isEnabled => {
        isAudioMuted = !isEnabled;
    });

    bridge.platform.on(bridge.EVENT_NAME.PAUSE_STATE_CHANGED, isPaused => {
        gameState.isPaused = isPaused;
        if (isPaused) sendPlatformMessage("level_paused");
        else sendPlatformMessage("level_resumed");
    });

    if (bridge.advertisement && bridge.EVENT_NAME.INTERSTITIAL_STATE_CHANGED) {
        if (typeof bridge.advertisement.setMinimumDelayBetweenInterstitial === 'function') {
            bridge.advertisement.setMinimumDelayBetweenInterstitial(30);
        }
        bridge.advertisement.on(bridge.EVENT_NAME.INTERSTITIAL_STATE_CHANGED, state => {
            if (state === 'opened' || state === 'loading') {
                isAdDisplaying = true;
                gameState.isPaused = true;
                sendPlatformMessage("level_paused");
            } else if (state === 'closed' || state === 'failed') {
                isAdDisplaying = false;
                gameState.isPaused = false;
                sendPlatformMessage("level_resumed");
            }
        });
    }

    if (bridge.advertisement && bridge.EVENT_NAME.REWARDED_STATE_CHANGED) {
        bridge.advertisement.on(bridge.EVENT_NAME.REWARDED_STATE_CHANGED, state => {
            if (state === 'opened' || state === 'loading') {
                isAdDisplaying = true;
                gameState.isPaused = true;
                sendPlatformMessage("level_paused");
            } else if (state === 'rewarded') {
                rewardEarnedPending = true; 
            } else if (state === 'closed' || state === 'failed') {
                executeLevelRestart(rewardEarnedPending);
                rewardEarnedPending = false; 
            }
        });
    }
}

async function initGame() {
    sendPlatformMessage("in_game_loading_started");
    if (bridge) {
        setupPlatformEventListeners();
        await handlePlayerAuthorization();
        await reconcileUnconsumedPurchases();

        if (bridge.storage && typeof bridge.storage.get === 'function') {
            try {
                bridge.storage.get(STORAGE_KEY)
                    .then((data) => {
                        if (data) {
                            gameState = { ...gameState, ...data };
                            currentLevelData = generateLevel(gameState.currentLevel);
                            if (gameState.hasSpeedBoost) gameState.player.speed = 8;
                            else gameState.player.speed = 5;
                        }
                        sendPlatformMessage("in_game_loading_stopped");
                        sendPlatformMessage("game_ready");
                        sendPlatformMessage("level_started");
                        gameState.isInitialized = true;
                        gameLoop();
                    })
                    .catch(error => {
                        console.error(error);
                        sendPlatformMessage("in_game_loading_stopped");
                        sendPlatformMessage("game_ready");
                        sendPlatformMessage("level_started");
                        gameState.isInitialized = true;
                        gameLoop(); 
                    });
                return;
            } catch (e) { console.warn(e); }
        }
    }
    sendPlatformMessage("in_game_loading_stopped");
    sendPlatformMessage("game_ready");
    sendPlatformMessage("level_started");
    gameState.isInitialized = true;
    gameLoop();
}

function resetPlayerPosition() {
    gameState.player.x = 40;
    gameState.player.y = 300;
    isTouching = false;
}

async function nextLevel() {
    if (gameState.currentLevel >= 150) {
        sendPlatformMessage("player_got_achievement");
        return alert("Congratulations! You Beat All 150 Levels!");
    }
    
    sendPlatformMessage("level_completed");
    gameState.isPaused = true;
    gameState.currentLevel++;
    gameState.player.speed = 5;
    gameState.hasSpeedBoost = false;

    currentLevelData = generateLevel(gameState.currentLevel);
    resetPlayerPosition();
    
    if (gameState.currentLevel === 5 || gameState.currentLevel === 15) {
        offerRetentionShortcuts();
    }

    if (bridge && bridge.advertisement && typeof bridge.advertisement.isInterstitialSupported !== 'undefined' && bridge.advertisement.isInterstitialSupported) {
        try { 
            let placement = 'next_level_placement';
            await bridge.advertisement.showInterstitial(placement); 
        } catch(err) { 
            console.warn(err); 
            gameState.isPaused = false; 
        }
    } else {
        gameState.isPaused = false;
    }
    
    keys = {}; 
    saveGame(); 
    sendPlatformMessage("level_started");
}

function update() {
    if (gameState.isPaused || !gameState.isInitialized || isAdDisplaying || showInGameLeaderboard) return;
    if (paymentMessageTimer > 0) paymentMessageTimer--;

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
        e.x += e.vx; e.y += e.vy;
        if (e.x < 0 || e.x > canvas.width - e.size) e.vx *= -1;
        if (e.y < 0 || e.y > canvas.height - e.size) e.vy *= -1;

        currentLevelData.walls.forEach(w => {
            if (e.x < w.x + w.w && e.x + e.size > w.x && e.y < w.y + w.h && e.y + e.size > w.y) {
                e.vx *= -1; e.vy *= -1;
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
            if (gameState.player.gold % 10 === 0) sendPlatformMessage("player_got_achievement");
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
    ctx.restore();

    ctx.fillStyle = "cyan";
    ctx.fillRect(gameState.player.x, gameState.player.y, 20, 20);
    
    ctx.fillStyle = "white";
    ctx.font = "bold 13px Arial";
    ctx.fillText(`User: ${playerName}`, 15, 30);
    ctx.fillText(`Lvl: ${gameState.currentLevel}`, 135, 30);
    ctx.fillText(`Gold: ${gameState.player.gold}`, 200, 30);
    
    if (gameState.hasSpeedBoost) {
        ctx.fillStyle = "#27ae60";
        ctx.font = "bold 11px Arial";
        ctx.fillText("⚡ SPEED BOOST ACTIVE", 15, 50);
    }

    if (paymentMessageTimer > 0) {
        ctx.fillStyle = "rgba(0, 0, 0, 0.75)";
        ctx.fillRect(150, 520, 500, 35);
        ctx.strokeStyle = "#27ae60";
        ctx.lineWidth = 1;
        ctx.strokeRect(150, 520, 500, 35);
        ctx.fillStyle = "#fff";
        ctx.font = "12px monospace";
        ctx.textAlign = "center";
        ctx.fillText(paymentStatusMessage, 400, 542);
        ctx.textAlign = "left"; 
    }

    if (isAdDisplaying) {
        ctx.fillStyle = "rgba(0, 0, 0, 0.85)";
        ctx.fillRect(0, 0, canvas.width, canvas.height);
        ctx.fillStyle = "#00ffaa";
        ctx.font = "bold 24px Arial";
        ctx.fillText("WAITING ON PLATFORM MEDIA FLOW...", 180, 300);
        return;
    }

    if (showInGameLeaderboard) {
        ctx.fillStyle = "rgba(10, 10, 15, 0.95)";
        ctx.fillRect(50, 70, 700, 480);
        ctx.strokeStyle = "#8e44ad";
        ctx.lineWidth = 3;
        ctx.strokeRect(50, 70, 700, 480);
        ctx.fillStyle = "#8e44ad";
        ctx.font = "bold 22px Arial";
        ctx.fillText("🏆 GLOBAL RANKINGS (IN-GAME DISPLAY) 🏆", 175, 115);
        ctx.fillStyle = "#7f8c8d";
        ctx.font = "12px Arial";
        ctx.fillText("Click 'RANKINGS' navigation button at top anytime to exit layout layer", 215, 140);

        if (leaderboardLoadingState === "Loading") {
            ctx.fillStyle = "#00a8ff";
            ctx.font = "bold 16px Arial";
            ctx.fillText("FETCHING SCORE SHEETS FROM PLATFORM...", 240, 290);
        } else if (leaderboardLoadingState === "Error") {
            ctx.fillStyle = "#ff4d4d";
            ctx.font = "bold 16px Arial";
            ctx.fillText("FAILED READING LEADERBOARDS FROM CONTAINER NODE.", 185, 290);
        } else if (leaderboardLoadingState === "Success") {
            ctx.fillStyle = "#27ae60";
            ctx.font = "bold 14px Arial";
            ctx.fillText("RANK", 100, 190);
            ctx.fillText("PLAYER NAME", 240, 190);
            ctx.fillText("GOLD COUNT SCORE", 540, 190);
            ctx.strokeStyle = "rgba(255,255,255,0.15)";
            ctx.lineWidth = 1;
            ctx.beginPath(); ctx.moveTo(90, 205); ctx.lineTo(710, 205); ctx.stroke();

            if (leaderboardEntries.length === 0) {
                ctx.fillStyle = "#aaa";
                ctx.fillText("No player rows registered inside this scope index yet.", 230, 260);
            } else {
                const renderLimit = Math.min(leaderboardEntries.length, 7);
                for (let i = 0; i < renderLimit; i++) {
                    const entry = leaderboardEntries[i];
                    const rowY = 240 + (i * 38);
                    ctx.fillStyle = (entry.name === playerName) ? "cyan" : "white";
                    ctx.font = "14px Arial";
                    ctx.fillText(`#${entry.rank || (i + 1)}`, 110, rowY);
                    ctx.fillText(`${entry.name || "Anonymous Explorer"}`, 240, rowY);
                    ctx.fillText(`${entry.score} 🪙`, 560, rowY);
                }
            }
        }
        return; 
    }

    if (isAudioMuted) {
        ctx.fillStyle = "#ff4d4d";
        ctx.font = "bold 10px Arial";
        ctx.fillText("🔇 MUTED", 745, 590);
    }

    ctx.font = "bold 10px Arial";
    Object.keys(buttons).forEach(key => {
        const b = buttons[key];
        ctx.fillStyle = b.color;
        ctx.fillRect(b.x, b.y, b.w, b.h);
        ctx.fillStyle = "white";
        
        let offset = 6;
        if(key === 'restart') offset = 10;
        if(key === 'leader') offset = 12;
        if(key === 'share') offset = 16;
        if(key === 'rate') offset = 16;
        if(key === 'fullscreen') offset = 4;
        if(key === 'buySpeed') offset = 11;
        
        ctx.fillText(b.label, b.x + offset, b.y + 21);
    });
}

window.addEventListener('keydown', e => keys[e.key.toLowerCase()] = true);
window.addEventListener('keyup', e => keys[e.key.toLowerCase()] = false);

function getMappedCoordinates(clientX, clientY) {
    const rect = canvas.getBoundingClientRect();
    const scaleX = rect.width > 0 ? canvas.width / rect.width : 1;
    const scaleY = rect.height > 0 ? canvas.height / rect.height : 1;
    return { x: (clientX - rect.left) * scaleX, y: (clientY - rect.top) * scaleY };
}

function handlePointerAction(clientX, clientY, isPressing) {
    if (isAdDisplaying) return; 
    const pos = getMappedCoordinates(clientX, clientY);

    if (isPressing) {
        let buttonClicked = false;
        
        Object.keys(buttons).forEach(key => {
            const b = buttons[key];
            if (pos.x >= b.x && pos.x <= b.x + b.w && pos.y >= b.y && pos.y <= b.y + b.h) {
                buttonClicked = true;
                if (showInGameLeaderboard && key !== 'leader') return; 

                if (key === 'buySpeed') buySpeedBoost();
                if (key === 'fullscreen') toggleFullscreen();
                if (key === 'share') shareGameProgress();
                if (key === 'rate') promptPlatformRate();
                if (key === 'leader') handleLeaderboardClick(); 
                if (key === 'restart') handleRestartWithReward();
            }
        });

        if (!buttonClicked && !showInGameLeaderboard) {
            isTouching = true;
            touchX = pos.x;
            touchY = pos.y;
        }
    }
}

canvas.addEventListener('mousedown', e => handlePointerAction(e.clientX, e.clientY, true));
canvas.addEventListener('mousemove', e => { if (isTouching) handlePointerAction(e.clientX, e.clientY, true); });
window.addEventListener('mouseup', () => isTouching = false);

canvas.addEventListener('touchstart', e => {
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
