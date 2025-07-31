let adsLoader, adsManager;
let adDisplayContainer, videoContent;

const vastTag = "https://essentialmost.com/d/mmF/z.d/GpNpvxZnGTUU/Weomv9RuQZpUNlkk/PATxY/1tNkTWAsxbNuDUcjtQN/jcUo1ZMlDnE/0WOQCTZLsoa/Wl1-pTdrDt0/xu";

function initAd() {
  videoContent = document.getElementById('content_video');
  adDisplayContainer = new google.ima.AdDisplayContainer(
    document.getElementById('ad_container'), videoContent
  );
  adDisplayContainer.initialize();

  adsLoader = new google.ima.AdsLoader(adDisplayContainer);

  adsLoader.addEventListener(
    google.ima.AdsManagerLoadedEvent.Type.ADS_MANAGER_LOADED,
    onAdsManagerLoaded,
    false
  );

  adsLoader.addEventListener(
    google.ima.AdErrorEvent.Type.AD_ERROR,
    onAdError,
    false
  );

  const adsRequest = new google.ima.AdsRequest();
  adsRequest.adTagUrl = vastTag;
  adsRequest.linearAdSlotWidth = 640;
  adsRequest.linearAdSlotHeight = 360;
  adsRequest.nonLinearAdSlotWidth = 640;
  adsRequest.nonLinearAdSlotHeight = 150;

  adsLoader.requestAds(adsRequest);
}

function onAdsManagerLoaded(adsManagerLoadedEvent) {
  adsManager = adsManagerLoadedEvent.getAdsManager(videoContent);

  adsManager.addEventListener(google.ima.AdErrorEvent.Type.AD_ERROR, onAdError);
  adsManager.addEventListener(google.ima.AdEvent.Type.CONTENT_RESUME_REQUESTED, () => {
    videoContent.play();
  });

  try {
    adsManager.init(640, 360, google.ima.ViewMode.NORMAL);
    adsManager.start();
  } catch (e) {
    console.log('AdsManager could not be started', e);
    videoContent.play();
  }
}

function onAdError(adErrorEvent) {
  console.log('Ad Error:', adErrorEvent.getError());
  if (adsManager) adsManager.destroy();
  videoContent.play();
}

document.getElementById('play_button').addEventListener('click', function () {
  this.style.display = 'none';
  initAd();
});
