package co.median.android.aaoraq;

import android.os.Bundle;
import androidx.annotation.Nullable;
import androidx.appcompat.app.AppCompatActivity;

import com.appodeal.ads.Appodeal;
import com.appodeal.ads.callbacks.InterstitialCallbacks;
import com.appodeal.ads.callbacks.RewardedVideoCallbacks;
import com.appodeal.ads.callbacks.BannerCallbacks;
import com.appodeal.ads.utils.Log;

import java.util.List;

public class MainActivity extends AppCompatActivity {

    private static final String APPODEAL_APP_KEY = "543d15c055aac7e15a71dae4432f7f78befc17eeed095af5";

    @Override
    protected void onCreate(@Nullable Bundle savedInstanceState) {
        super.onCreate(savedInstanceState);
        setContentView(R.layout.activity_main);

        int adTypes = Appodeal.BANNER | Appodeal.INTERSTITIAL | Appodeal.REWARDED_VIDEO;

        // Initialize Appodeal
        Appodeal.initialize(this, APPODEAL_APP_KEY, adTypes, new Appodeal.AppodealInitializationCallbacks() {
            @Override
            public void onInitializationFinished(@Nullable List<com.appodeal.ads.utils.ApdInitializationError> errors) {
                Log.d("Appodeal", "Initialization finished");
            }
        });

        // Set Banner Callbacks
        Appodeal.setBannerCallbacks(new BannerCallbacks() {
            @Override
            public void onBannerLoaded(int height, boolean isPrecache) {
                Log.d("Appodeal", "Banner loaded");
            }

            @Override
            public void onBannerFailedToLoad() {
                Log.d("Appodeal", "Banner failed to load");
            }

            @Override
            public void onBannerShown() {
                Log.d("Appodeal", "Banner shown");
            }

            @Override
            public void onBannerShowFailed() {
                Log.d("Appodeal", "Banner show failed");
            }

            @Override
            public void onBannerClicked() {
                Log.d("Appodeal", "Banner clicked");
            }

            @Override
            public void onBannerExpired() {
                Log.d("Appodeal", "Banner expired");
            }
        });

        // Set Interstitial Callbacks
        Appodeal.setInterstitialCallbacks(new InterstitialCallbacks() {
            @Override
            public void onInterstitialLoaded(boolean isPrecache) {
                Log.d("Appodeal", "Interstitial loaded");
            }

            @Override
            public void onInterstitialFailedToLoad() {
                Log.d("Appodeal", "Interstitial failed to load");
            }

            @Override
            public void onInterstitialShown() {
                Log.d("Appodeal", "Interstitial shown");
            }

            @Override
            public void onInterstitialShowFailed() {
                Log.d("Appodeal", "Interstitial show failed");
            }

            @Override
            public void onInterstitialClicked() {
                Log.d("Appodeal", "Interstitial clicked");
            }

            @Override
            public void onInterstitialClosed() {
                Log.d("Appodeal", "Interstitial closed");
            }

            @Override
            public void onInterstitialExpired() {
                Log.d("Appodeal", "Interstitial expired");
            }
        });

        // Set Rewarded Video Callbacks
        Appodeal.setRewardedVideoCallbacks(new RewardedVideoCallbacks() {
            @Override
            public void onRewardedVideoLoaded(boolean isPrecache) {
                Log.d("Appodeal", "Rewarded video loaded");
            }

            @Override
            public void onRewardedVideoFailedToLoad() {
                Log.d("Appodeal", "Rewarded video failed to load");
            }

            @Override
            public void onRewardedVideoShown() {
                Log.d("Appodeal", "Rewarded video shown");
            }

            @Override
            public void onRewardedVideoShowFailed() {
                Log.d("Appodeal", "Rewarded video show failed");
            }

            @Override
            public void onRewardedVideoClicked() {
                Log.d("Appodeal", "Rewarded video clicked");
            }

            @Override
            public void onRewardedVideoFinished(double amount, String name) {
                Log.d("Appodeal", "Rewarded video finished - reward user");
                // TODO: Reward your user here
            }

            @Override
            public void onRewardedVideoClosed(boolean finished) {
                Log.d("Appodeal", "Rewarded video closed");
            }

            @Override
            public void onRewardedVideoExpired() {
                Log.d("Appodeal", "Rewarded video expired");
            }
        });

        // Show banner at bottom automatically
        Appodeal.show(this, Appodeal.BANNER_BOTTOM);

        // Show interstitial automatically if loaded
        if (Appodeal.isLoaded(Appodeal.INTERSTITIAL)) {
            Appodeal.show(this, Appodeal.INTERSTITIAL);
        }

        // Show rewarded video automatically if loaded
        if (Appodeal.isLoaded(Appodeal.REWARDED_VIDEO)) {
            Appodeal.show(this, Appodeal.REWARDED_VIDEO);
        }
    }
}
