package co.median.android.aaoraq;

import android.os.Bundle;
import android.webkit.WebView;
import android.webkit.WebViewClient;
import android.webkit.WebChromeClient;
import android.webkit.WebSettings;
import android.webkit.JavascriptInterface;
import android.util.Log;

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
        webSettings.setMediaPlaybackRequiresUserGesture(false); // for Unity video
        myWebView.setWebViewClient(new WebViewClient());
        myWebView.setWebChromeClient(new WebChromeClient()); // optional

        myWebView.loadUrl("file:///android_asset/index.html");

        // Attach JS interface
        myWebView.addJavascriptInterface(new MyJavaScriptInterface(), "Android");

        // Start.io initialization
        StartAppSDK.init(this, "205787982", true);
        StartAppAd.disableSplash();

        // Unity initialization
        UnityAds.initialize(this, UNITY_GAME_ID, TEST_MODE);
        UnityAds.setListener(new UnityAdsListener());

        // Auto-show Start.io Interstitial
        myWebView.postDelayed(() -> StartAppAd.showAd(MainActivity.this), 7000);

        // Auto-show Unity Interstitial
        myWebView.postDelayed(() -> {
            if (UnityAds.isReady(UNITY_INTERSTITIAL)) {
                UnityAds.show(MainActivity.this, UNITY_INTERSTITIAL);
            } else {
                Log.d("UnityAd", "Unity Interstitial not ready");
            }
        }, 15000);

        // Auto-show Unity Rewarded
        myWebView.postDelayed(() -> {
            if (UnityAds.isReady(UNITY_REWARDED)) {
                UnityAds.show(MainActivity.this, UNITY_REWARDED);
            } else {
                Log.d("UnityAd", "Unity Rewarded not ready");
            }
        }, 30000);
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
        public void onUnityAdsError(UnityAds.UnityAdsError error, String message) {
            Log.e("UnityAdsError", message);
        }
    }
}
