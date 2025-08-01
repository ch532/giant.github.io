<?php
header("Access-Control-Allow-Origin: *");
header("Content-Type: application/json");

$rss_url = "https://www.cpagrip.com/common/offer_feed_rss.php?user_id=2410602&key=09d05f6413bec0a39584b6029a51c0f0";
$xml = simplexml_load_file($rss_url);

if (!$xml || !isset($xml->channel->item)) {
    echo json_encode(["error" => "Failed to load CPAgrip offers"]);
    exit;
}

$offers = [];
foreach ($xml->channel->item as $item) {
    $offers[] = [
        "title" => (string) $item->title,
        "link" => (string) $item->link,
        "description" => (string) $item->description,
        "pubDate" => (string) $item->pubDate
    ];
}

echo json_encode($offers);
