package co.median.android.aaoraq;

import android.app.Activity;
import android.webkit.JavascriptInterface;
import com.appodeal.ads.Appodeal;

public class AppodealJSInterface {

    private final Activity mActivity;

    public AppodealJSInterface(Activity activity) {
        this.mActivity = activity;
    }

    @JavascriptInterface
    public void showBanner() {
        mActivity.runOnUiThread(() -> Appodeal.show(mActivity, Appodeal.BANNER_BOTTOM));
    }

    @JavascriptInterface
    public void showInterstitial() {
        if (Appodeal.isLoaded(Appodeal.INTERSTITIAL)) {
            mActivity.runOnUiThread(() -> Appodeal.show(mActivity, Appodeal.INTERSTITIAL));
        }
    }

    @JavascriptInterface
    public void showRewarded() {
        if (Appodeal.isLoaded(Appodeal.REWARDED_VIDEO)) {
            mActivity.runOnUiThread(() -> Appodeal.show(mActivity, Appodeal.REWARDED_VIDEO));
        }
    }
}
