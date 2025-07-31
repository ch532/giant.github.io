let adDisplayContainer;
let adsLoader;
let adsManager;
let videoContent;

function initAdDisplayContainer() {
  adDisplayContainer = new google.ima.AdDisplayContainer(
    document.getElementById('adContainer'),
    videoContent
  );
}

function requestAds() {
  const adsRequest = new google.ima.AdsRequest();
  adsRequest.adTagUrl = "https://essentialmost.com/d/mmF/z.d/GpNpvxZnGTUU/Weomv9RuQZpUNlkk/PATxY/1tNkTWAsxbNuDUcjtQN/jcUo1ZMlDnE/0WOQCTZLsoa/Wl1-pTdrDt0/xu";

  adsRequest.linearAdSlotWidth = 640;
  adsRequest.linearAdSlotHeight = 360;

  adsRequest.nonLinearAdSlotWidth = 640;
  adsRequest.nonLinearAdSlotHeight = 150;

  adsLoader.requestAds(adsRequest);
}

function setUpIMA() {
  videoContent = document.getElementById('contentElement');
  initAdDisplayContainer();

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

  requestAds();
}

function onAdsManagerLoaded(adsManagerLoadedEvent) {
  adsManager = adsManagerLoadedEvent.getAdsManager(videoContent);

  adsManager.addEventListener(
    google.ima.AdErrorEvent.Type.AD_ERROR,
    onAdError
  );

  adsManager.addEventListener(
    google.ima.AdEvent.Type.CONTENT_RESUME_REQUESTED,
    () => videoContent.play()
  );

  try {
    adsManager.init(640, 360, google.ima.ViewMode.NORMAL);
    adsManager.start();
  } catch (adError) {
    console.log("AdsManager could not be started: " + adError);
    videoContent.play();
  }
}

function onAdError(adErrorEvent) {
  console.log("Ad error: ", adErrorEvent.getError());
  videoContent.play();
}

document.getElementById('playButton').addEventListener('click', () => {
  videoContent.load();
  adDisplayContainer.initialize();
  setUpIMA();
});
