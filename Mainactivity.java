import android.os.Bundle;
import android.webkit.WebView;
import android.webkit.WebViewClient;
import android.webkit.JavascriptInterface;

import androidx.appcompat.app.AppCompatActivity;

import com.appodeal.ads.Appodeal;

public class MainActivity extends AppCompatActivity {

    WebView webView;

    @Override
    protected void onCreate(Bundle savedInstanceState) {
        super.onCreate(savedInstanceState);

        Appodeal.initialize(this, "923bc30ebaca5186de21bbebb9612173a8759ba61bbb4ed0", 
                Appodeal.INTERSTITIAL | Appodeal.BANNER | Appodeal.REWARDED_VIDEO);

        setContentView(R.layout.activity_main);

        webView = findViewById(R.id.webview); // Make sure you have this in your layout XML
        webView.getSettings().setJavaScriptEnabled(true);
        webView.addJavascriptInterface(new AndroidInterface(), "AndroidInterface");
        webView.setWebViewClient(new WebViewClient());
        webView.loadUrl("file:///android_asset/index.html"); // Adjust path if needed
    }

    public class AndroidInterface {
        @JavascriptInterface
        public void showBannerAd() {
            runOnUiThread(() -> Appodeal.show(MainActivity.this, Appodeal.BANNER_BOTTOM));
        }

        @JavascriptInterface
        public void showInterstitialAd() {
            if (Appodeal.isLoaded(Appodeal.INTERSTITIAL)) {
                runOnUiThread(() -> Appodeal.show(MainActivity.this, Appodeal.INTERSTITIAL));
            }
        }

        @JavascriptInterface
        public void showRewardedAd() {
            if (Appodeal.isLoaded(Appodeal.REWARDED_VIDEO)) {
                runOnUiThread(() -> Appodeal.show(MainActivity.this, Appodeal.REWARDED_VIDEO));
            }
        }
    }
}
