public class AndroidInterface {
    @JavascriptInterface
    public void showBannerAd() {
        Appodeal.show(MainActivity.this, Appodeal.BANNER_BOTTOM);
    }

    @JavascriptInterface
    public void showInterstitialAd() {
        if (Appodeal.isLoaded(Appodeal.INTERSTITIAL)) {
            Appodeal.show(MainActivity.this, Appodeal.INTERSTITIAL);
        }
    }

    @JavascriptInterface
    public void showRewardedAd() {
        if (Appodeal.isLoaded(Appodeal.REWARDED_VIDEO)) {
            Appodeal.show(MainActivity.this, Appodeal.REWARDED_VIDEO);
        }
    }
}
