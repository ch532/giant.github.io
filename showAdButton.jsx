import { useCallback } from 'react'
import { useAdsgram } from "../hooks/useAdsgram"

export function ShowAdButton() {
  const onReward = useCallback(() => {
    alert('Reward');
  }, []);

  const onError = useCallback((result) => {
    alert(JSON.stringify(result, null, 4));
  }, []);

  // Rewarded ads
const RewardedController = window.Adsgram.init({ blockId: "14637" });

// Interstitial ads (new block ID from dashboard)
const InterstitialController = window.Adsgram.init({ blockId: "int-14639" });

// Show rewarded ad
function showRewardedAd() {
  RewardedController.show()
    .then(() => {
      // ✅ user finished watching rewarded ad
      alert("Reward granted");
    })
    .catch((result) => {
      console.log("Rewarded error", result);
    });
}

// Show interstitial ad
function showInterstitialAd() {
  InterstitialController.show()
    .then(() => {
      // User closed ad (no reward)
      console.log("Interstitial closed");
    })
    .catch((result) => {
      console.log("Interstitial error", result);
    });
}
}
