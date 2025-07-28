package co.median.android.aaoraq;

import android.app.Activity;
import android.content.Context;
import android.webkit.JavascriptInterface;
import android.widget.Toast;
import com.startapp.sdk.adsbase.StartAppAd;
import com.startapp.sdk.adsbase.StartAppSDK;
import com.unity3d.ads.IUnityAdsListener;
import com.unity3d.ads.UnityAds;

public class AndroidInterface {
    private Activity activity;
    private StartAppAd startAppAd;

    public AndroidInterface(Activity activity) {
        this.activity = activity;
        this.startAppAd = new StartAppAd(activity);

        // Initialize Unity Ads
        UnityAds.initialize(activity, "5883117", false); // Change false to true to enable test mode

        // Unity Ads listener
        UnityAds.setListener(new IUnityAdsListener() {
            @Override
            public void onUnityAdsReady(String placementId) {}

            @Override
            public void onUnityAdsStart(String placementId) {}

            @Override
            public void onUnityAdsFinish(String placementId, UnityAds.FinishState result) {}

            @Override
            public void onUnityAdsError(UnityAds.UnityAdsError error, String message) {
                Toast.makeText(activity, "UnityAds Error: " + message, Toast.LENGTH_SHORT).show();
            }
        });

        // Initialize Start.io
        StartAppSDK.init(activity, "205787982", true);
    }

    @JavascriptInterface
    public void showBannerAd() {
        // You need to add the StartApp banner in your layout XML
        Toast.makeText(activity, "Banner ad triggered from JS", Toast.LENGTH_SHORT).show();
    }

    @JavascriptInterface
    public void showInterstitialAd() {
        activity.runOnUiThread(() -> {
            if (UnityAds.isReady()) {
                UnityAds.show(activity);
            } else {
                startAppAd.showAd(); // fallback to Start.io if Unity not ready
            }
        });
    }

    @JavascriptInterface
    public void showRewardedAd() {
        activity.runOnUiThread(() -> {
            if (UnityAds.isReady("rewardedVideo")) {
                UnityAds.show(activity, "rewardedVideo");
            } else {
                startAppAd.showAd(); // fallback to Start.io
            }
        });
    }
}
