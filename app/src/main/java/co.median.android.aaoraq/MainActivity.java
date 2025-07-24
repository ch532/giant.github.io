package co.median.android.aaoraq;

import android.app.Activity;
import android.os.Bundle;
import android.webkit.WebView;
import android.webkit.WebViewClient;
import com.appodeal.ads.Appodeal;

public class MainActivity extends Activity {

    private WebView webView;

    @Override
    protected void onCreate(Bundle savedInstanceState) {
        super.onCreate(savedInstanceState);
        setContentView(R.layout.activity_main); // Make sure you have this layout with a WebView

        // 1. Initialize Appodeal
        Appodeal.initialize(this, "923bc30ebaca5186de21bbebb9612173a8759ba61bbb4ed0",
                Appodeal.BANNER | Appodeal.INTERSTITIAL | Appodeal.REWARDED_VIDEO);

        // 2. Setup WebView
        webView = findViewById(R.id.webview);
        webView.getSettings().setJavaScriptEnabled(true);
        webView.setWebViewClient(new WebViewClient());
        webView.addJavascriptInterface(new AppodealJSInterface(this), "AndroidAdInterface");

        // 3. Load your hosted page
        webView.loadUrl("https://connectgold.sbs/index.html");
    }
}
