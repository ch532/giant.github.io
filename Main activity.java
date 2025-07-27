package co.median.android.aaoraq;

import android.os.Bundle;
import android.webkit.WebView;
import android.webkit.WebViewClient;
import androidx.appcompat.app.AppCompatActivity;

import com.appodeal.ads.Appodeal;
import com.appodeal.ads.AppodealCallbacks;

public class MainActivity extends AppCompatActivity {

    WebView webView;

    @Override
    protected void onCreate(Bundle savedInstanceState) {
        super.onCreate(savedInstanceState);

        // Init Appodeal SDK
        String appKey = "923bc30ebaca5186de21bbebb9612173a8759ba61bbb4ed0";
        Appodeal.initialize(this, appKey, 
            Appodeal.BANNER | Appodeal.INTERSTITIAL | Appodeal.REWARDED_VIDEO);

        setContentView(R.layout.activity_main);

        // Load WebView
        webView = findViewById(R.id.webView);
        webView.setWebViewClient(new WebViewClient());
        webView.getSettings().setJavaScriptEnabled(true);

        // Load your HTML file or URL
        webView.loadUrl("file:///android_asset/index.html");

        // Add JS Interface if needed later
        // webView.addJavascriptInterface(new JSBridge(this), "Android");

        // Automatically show banner ad when ready
        Appodeal.setBannerViewId(R.id.appodealBannerView);  // If using banner in layout
        Appodeal.show(this, Appodeal.BANNER_BOTTOM);

        // Automatically show interstitial and rewarded when loaded
        Appodeal.setAutoCache(Appodeal.INTERSTITIAL, true);
        Appodeal.setAutoCache(Appodeal.REWARDED_VIDEO, true);

        Appodeal.setInterstitialCallbacks(new AppodealCallbacks.InterstitialCallbacks() {
            @Override
            public void onInterstitialLoaded(boolean isPrecache) {
                Appodeal.show(MainActivity.this, Appodeal.INTERSTITIAL);
            }
            @Override public void onInterstitialFailedToLoad() {}
            @Override public void onInterstitialShown() {}
            @Override public void onInterstitialShowFailed() {}
            @Override public void onInterstitialClicked() {}
            @Override public void onInterstitialClosed() {}
            @Override public void onInterstitialExpired() {}
        });

        Appodeal.setRewardedVideoCallbacks(new AppodealCallbacks.RewardedVideoCallbacks() {
            @Override
            public void onRewardedVideoLoaded(boolean isPrecache) {
                Appodeal.show(MainActivity.this, Appodeal.REWARDED_VIDEO);
            }
            @Override public void onRewardedVideoFailedToLoad() {}
            @Override public void onRewardedVideoShown() {}
            @Override public void onRewardedVideoShowFailed() {}
            @Override public void onRewardedVideoFinished(double amount, String name) {}
            @Override public void onRewardedVideoClosed(boolean finished) {}
            @Override public void onRewardedVideoExpired() {}
            @Override public void onRewardedVideoClicked() {}
        });
    }
}
