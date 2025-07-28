package co.median.android.aaoraq

import android.annotation.SuppressLint;
import android.os.Bundle;
import android.webkit.WebSettings;
import android.webkit.WebView;
import android.webkit.WebViewClient;

import androidx.appcompat.app.AppCompatActivity;

public class MainActivity extends AppCompatActivity {
    WebView webView;

    @SuppressLint("SetJavaScriptEnabled")
    @Override
    protected void onCreate(Bundle savedInstanceState) {
        super.onCreate(savedInstanceState);

        webView = new WebView(this);
        setContentView(webView);

        WebSettings settings = webView.getSettings();
        settings.setJavaScriptEnabled(true);

        // Load from assets/index.html
        webView.loadUrl("file:///android_asset/index.html");

        // Attach JS interface
        webView.addJavascriptInterface(new JSInterface(this), "AndroidBridge");

        // Keep navigation inside WebView
        webView.setWebViewClient(new WebViewClient());
    }
}
