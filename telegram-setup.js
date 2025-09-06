// telegram-setup.js

// Make sure Telegram WebApp is ready
if (window.Telegram?.WebApp) {
    Telegram.WebApp.ready();
}

// Detect Telegram WebView and enable pinch zoom
if (navigator.userAgent.toLowerCase().includes("telegram")) {
    document.addEventListener("DOMContentLoaded", () => {
        document.body.style.touchAction = "pinch-zoom";
        document.body.style.overflow = "auto";
    });
}
