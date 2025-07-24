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
        Appodeal.initialize(this, "YOUR_APPODEAL_KEY", // 🔁 Replace with your actual key
                Appodeal.BANNER | Appodeal.INTERSTITIAL | Appodeal.REWARDED_VIDEO);

        // 2. Setup WebView
        webView = findViewById(R.id.webview);
        webView.getSettings().setJavaScriptEnabled(true);
        webView.setWebViewClient(new WebViewClient()); // Stay inside app
        webView.addJavascriptInterface(new AppodealJSInterface(this), "AndroidAdInterface");

        // 3. Load HTML (local or online)
        webView.loadUrl("https://connectgold.sbs"); // or use https://connectgold.sbs/adpage.html
    }
}
