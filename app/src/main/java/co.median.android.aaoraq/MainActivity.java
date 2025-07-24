package co.median.android.aaoraq;

import android.os.Bundle;
import android.webkit.WebView;
import androidx.appcompat.app.AppCompatActivity;
import com.appodeal.ads.Appodeal;

public class MainActivity extends AppCompatActivity {

    private WebView webView;

    @Override
    protected void onCreate(Bundle savedInstanceState) {
        super.onCreate(savedInstanceState);

        // Initialize Appodeal
        Appodeal.initialize(this, "YOUR_APPODEAL_API_KEY", Appodeal.BANNER | Appodeal.INTERSTITIAL);

        // Load layout with WebView
        setContentView(R.layout.activity_main);

        // Set up WebView
        webView = findViewById(R.id.webview);
        webView.getSettings().setJavaScriptEnabled(true);

        // Add interface for JS to trigger native ads
        webView.addJavascriptInterface(new AppodealJSInterface(this), "AndroidAdInterface");

        // Load your local HTML or online site
        webView.loadUrl("file:///android_asset/index.html");
        // or for online: webView.loadUrl("https://www.yoursite.com");
    }
}
