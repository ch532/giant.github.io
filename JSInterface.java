package co.median.android.aaoraq;

import android.content.Context;
import android.webkit.JavascriptInterface;
import android.widget.Toast;

public class JSInterface {
    Context context;

    public JSInterface(Context context) {
        this.context = context;
    }

    @JavascriptInterface
    public void showToast(String msg) {
        Toast.makeText(context, msg, Toast.LENGTH_SHORT).show();
    }

    @JavascriptInterface
    public void triggerAd() {
        // Your Appodeal or ad SDK call here
        // Appodeal.show(this.context, Appodeal.INTERSTITIAL);
    }
}
