import android.app.Activity;
import android.content.Context;
import android.webkit.JavascriptInterface;
import com.appodeal.ads.Appodeal;

public class AppodealJSInterface {
    Context mContext;

    public AppodealJSInterface(Context context) {
        mContext = context;
    }

    @JavascriptInterface
    public void showBanner() {
        Appodeal.show((Activity) mContext, Appodeal.BANNER_BOTTOM);
    }

    @JavascriptInterface
    public void showInterstitial() {
        if (Appodeal.isLoaded(Appodeal.INTERSTITIAL)) {
            Appodeal.show((Activity) mContext, Appodeal.INTERSTITIAL);
        }
    }
}
