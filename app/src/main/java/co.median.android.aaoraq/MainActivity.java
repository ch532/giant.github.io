import android.app.Activity;
import android.os.Bundle;
import android.webkit.WebView;
import com.huawei.openalliance.ad.jsb.PPSJsBridge;
import com.huawei.openalliance.ad.jsb.inner.JsbConfig;

public class MainActivity extends Activity {

    private WebView mWebview;
    private PPSJsBridge bridge;

    @Override
    protected void onCreate(Bundle savedInstanceState) {
        super.onCreate(savedInstanceState);
        setContentView(R.layout.activity_main);

        mWebview = findViewById(R.id.webView);
        mWebview.getSettings().setJavaScriptEnabled(true);
        mWebview.getSettings().setDomStorageEnabled(true);

        PPSJsBridge.init(new JsbConfig.Builder()
                .enableUserInfo(true)
                .enableLog(true)
                .build());

        bridge = new PPSJsBridge(mWebview);

        mWebview.loadUrl("file:///android_asset/index.html"); // or remote URL
    }
}
