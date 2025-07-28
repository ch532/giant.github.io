package co.median.android.aaoraq;

import android.os.Bundle;
import android.webkit.WebView;
import android.webkit.WebViewClient;
import android.webkit.WebSettings;
import android.webkit.JavascriptInterface;

import androidx.appcompat.app.AppCompatActivity;

import com.startapp.sdk.adsbase.StartAppAd;
import com.startapp.sdk.adsbase.StartAppSDK;

import com.unity3d.ads.IUnityAdsListener;
import com.unity3d.ads.UnityAds;

public class MainActivity extends AppCompatActivity {

    private WebView myWebView;
    private static final String UNITY_GAME_ID = "5883117";
    private static final String UNITY_INTERSTITIAL = "Interstitial_Android";
    private static final String UNITY_REWARDED = "Rewarded_Android";
    private static final boolean TEST_MODE = false;

    @Override
    protected void onCreate(Bundle savedInstanceState) {
        super.onCreate(savedInstanceState);

        myWebView = new WebView(this);
        setContentView(myWebView);

        WebSettings webSettings = myWebView.getSettings();
        webSettings.setJavaScriptEnabled(true);

        myWebView.setWebViewClient(new WebViewClient());
        myWebView.loadUrl("file:///android_asset/index.html"); // or your main HTML page

        // Attach JS interface
        myWebView.addJavascriptInterface(new MyJavaScriptInterface(), "Android");

        // Initialize Start.io
        StartAppSDK.init(this, "205787982", true);
        StartAppAd.disableSplash(); // Optional: remove Start.io splash ad

        // Initialize Unity Ads
        UnityAds.initialize(this, UNITY_GAME_ID, TEST_MODE);
        UnityAds.setListener(new UnityAdsListener());

        // Auto-show Start.io interstitial after delay
        myWebView.postDelayed(() -> {
            StartAppAd.showAd(MainActivity.this);
        }, 7000); // 7 seconds after launch

        // Auto-show Unity Interstitial
        myWebView.postDelayed(() -> {
            if (UnityAds.isReady(UNITY_INTERSTITIAL)) {
                UnityAds.show(MainActivity.this, UNITY_INTERSTITIAL);
            }
        }, 15000); // 15 seconds after launch

        // Auto-show Unity Rewarded
        myWebView.postDelayed(() -> {
            if (UnityAds.isReady(UNITY_REWARDED)) {
                UnityAds.show(MainActivity.this, UNITY_REWARDED);
            }
        }, 30000); // 30 seconds after launch
    }

    public class MyJavaScriptInterface {
        @JavascriptInterface
        public void showStartAppAd() {
            StartAppAd.showAd(MainActivity.this);
        }

        @JavascriptInterface
        public void showUnityInterstitial() {
            if (UnityAds.isReady(UNITY_INTERSTITIAL)) {
                UnityAds.show(MainActivity.this, UNITY_INTERSTITIAL);
            }
        }

        @JavascriptInterface
        public void showUnityRewarded() {
            if (UnityAds.isReady(UNITY_REWARDED)) {
                UnityAds.show(MainActivity.this, UNITY_REWARDED);
            }
        }
    }

    private class UnityAdsListener implements IUnityAdsListener {
        @Override
        public void onUnityAdsReady(String placementId) {}
        @Override
        public void onUnityAdsStart(String placementId) {}
        @Override
        public void onUnityAdsFinish(String placementId, UnityAds.FinishState result) {}
        @Override
        public void onUnityAdsError(UnityAds.UnityAdsError error, String message) {}
    }
}
