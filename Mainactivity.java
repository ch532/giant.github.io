package co.median.android.aaoraq;

import android.os.Bundle;
import android.webkit.WebView;
import android.webkit.WebViewClient;
import com.appodeal.ads.Appodeal;
import com.appodeal.ads.BannerView;
import android.webkit.JavascriptInterface;
import android.widget.RelativeLayout;
import android.view.ViewGroup;
import androidx.appcompat.app.AppCompatActivity;

public class MainActivity extends AppCompatActivity {
    private WebView webView;
    private final String APP_KEY = "543d15c055aac7e15a71dae4432f7f78befc17eeed095af5";

    @Override
    protected void onCreate(Bundle savedInstanceState) {
        super.onCreate(savedInstanceState);

        // Set up layout with WebView and BannerView
        RelativeLayout layout = new RelativeLayout(this);
        webView = new WebView(this);
        webView.getSettings().setJavaScriptEnabled(true);
        webView.setWebViewClient(new WebViewClient());
        webView.loadUrl("https://connectgold.sbs/");
        webView.addJavascriptInterface(new JSBridge(), "AndroidApp");

        // Add WebView to layout
        RelativeLayout.LayoutParams webParams = new RelativeLayout.LayoutParams(
                ViewGroup.LayoutParams.MATCH_PARENT,
                ViewGroup.LayoutParams.MATCH_PARENT
        );
        layout.addView(webView, webParams);

        // Add Appodeal banner at bottom
        BannerView bannerView = new BannerView(this);
        bannerView.setPlacement("default");

        RelativeLayout.LayoutParams bannerParams = new RelativeLayout.LayoutParams(
                ViewGroup.LayoutParams.MATCH_PARENT,
                ViewGroup.LayoutParams.WRAP_CONTENT
        );
        bannerParams.addRule(RelativeLayout.ALIGN_PARENT_BOTTOM);
        layout.addView(bannerView, bannerParams);

        setContentView(layout);

        // Initialize Appodeal with banner, interstitial, and rewarded
        int adTypes = Appodeal.BANNER | Appodeal.INTERSTITIAL | Appodeal.REWARDED_VIDEO;
        Appodeal.initialize(this, APP_KEY, adTypes);

        // Show all ads automatically after initialization
        webView.postDelayed(() -> {
            if (Appodeal.isInitialized(Appodeal.INTERSTITIAL)) {
                Appodeal.show(this, Appodeal.INTERSTITIAL);
            }
            if (Appodeal.isInitialized(Appodeal.REWARDED_VIDEO)) {
                Appodeal.show(this, Appodeal.REWARDED_VIDEO);
            }
        }, 4000); // wait 4 seconds after init to show ads
    }

    // JavaScript Interface
    private class JSBridge {
        @JavascriptInterface
        public void showInterstitial() {
            if (Appodeal.isLoaded(Appodeal.INTERSTITIAL)) {
                Appodeal.show(MainActivity.this, Appodeal.INTERSTITIAL);
            }
        }

        @JavascriptInterface
        public void showRewarded() {
            if (Appodeal.isLoaded(Appodeal.REWARDED_VIDEO)) {
                Appodeal.show(MainActivity.this, Appodeal.REWARDED_VIDEO);
            }
        }
    }
}
