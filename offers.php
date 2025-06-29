<?php
$tracking_id = 'telegram';
$userip = '105.112.114.202'; // hardcoded for now
$user_agent = $_SERVER['HTTP_USER_AGENT'];
$max_offers = 10;

$feedurl = 'https://www.cpagrip.com/common/offer_feed_rss.php?user_id=2410602&key=09d05f6413bec0a39584b6029a51c0f0&limit=' . $max_offers . '&ip=' . $userip . '&ua=' . urlencode($user_agent) . '&tracking_id=' . urlencode($tracking_id);

$ch = curl_init();
curl_setopt($ch, CURLOPT_URL, $feedurl);
curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
$output = curl_exec($ch);
curl_close($ch);

$xml = @simplexml_load_string($output);
if ($xml !== false && count($xml->offers->offer) > 0) {
    foreach ($xml->offers->offer as $offeritem) {
        $link = str_replace('www.cpagrip.com', 'filetrkr.com', $offeritem->offerlink);
        echo '<a href="' . $link . '" target="_blank" style="display:block;margin:10px 0;">' . $offeritem->title . '</a>';
    }
} else {
    echo 'No offers available for your region.';
}
?>
