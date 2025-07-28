package co.median.android.aaoraq;

import android.os.Bundle;
import android.webkit.WebView;
import android.webkit.WebViewClient;
import android.webkit.JavascriptInterface;
import android.app.Activity;
import android.util.Log;

import com.tapjoy.TJConnectListener;
import com.tapjoy.Tapjoy;
import com.tapjoy.TJPlacement;
import com.tapjoy.TJPlacementListener;
import com.tapjoy.TJError;

import java.util.Hashtable;

public class MainActivity extends Activity {

    private WebView webView;
    private TJPlacement tjPlacement;

    private final String sdkKey = "diuJjmdIQxiNayNGui2c6wECIOUTDuKT71ktOdaLIhgC708EZWo5Sx5bI9ll";
    private final String placementName = "Connect Gold";

    @Override
    protected void onCreate(Bundle savedInstanceState) {
        super.onCreate(savedInstanceState);

        // Setup WebView
        webView = new WebView(this);
        setContentView(webView);
        webView.getSettings().setJavaScriptEnabled(true);
        webView.setWebViewClient(new WebViewClient());

        // Add JavaScript interface
        webView.addJavascriptInterface(new WebAppInterface(), "Android");

        // Load your local or remote HTML
        webView.loadUrl("file:///android_asset/index.html"); // or use a remote URL

        // Initialize Tapjoy
        Hashtable<String, Object> flags = new Hashtable<>();
        Tapjoy.connect(this, sdkKey, flags, new TJConnectListener() {
            @Override
            public void onConnectSuccess() {
                Log.d("Tapjoy", "Connected successfully");
                tjPlacement = Tapjoy.getPlacement(placementName, new TJPlacementListener() {
                    @Override
                    public void onRequestSuccess(TJPlacement placement) {
                        if (placement.isContentAvailable()) {
                            placement.showContent();
                        }
                    }

                    @Override
                    public void onRequestFailure(TJPlacement placement, TJError error) {
                        Log.e("Tapjoy", "Request failed: " + error.message);
                    }

                    @Override
                    public void onContentReady(TJPlacement placement) {
                        placement.showContent();
                    }

                    @Override
                    public void onContentShow(TJPlacement placement) {}

                    @Override
                    public void onContentDismiss(TJPlacement placement) {}

                    @Override
                    public void onPurchaseRequest(TJPlacement placement, TJActionRequest request, String productId) {}

                    @Override
                    public void onRewardRequest(TJPlacement placement, TJActionRequest request, String itemId, int quantity) {}
                });

                tjPlacement.requestContent(); // Auto-request ad
            }

            @Override
            public void onConnectFailure() {
                Log.e("Tapjoy", "Tapjoy connection failed");
            }
        });
    }

    // JS Interface if you ever want to trigger from HTML
    private class WebAppInterface {
        @JavascriptInterface
        public void showAd() {
            if (tjPlacement != null && tjPlacement.isContentReady()) {
                tjPlacement.showContent();
            }
        }
    }
}
