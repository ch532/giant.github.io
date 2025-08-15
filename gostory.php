<?php
// Set the Google News RSS feed URL
$feed_url = "https://news.google.com/rss?hl=en-US&gl=US&ceid=US:en";

// Use cURL to fetch the RSS feed
$ch = curl_init();
curl_setopt($ch, CURLOPT_URL, $feed_url);
curl_setopt($ch, CURLOPT_RETURNTRANSFER, 1);
curl_setopt($ch, CURLOPT_FOLLOWLOCATION, true);
curl_setopt($ch, CURLOPT_SSL_VERIFYPEER, false); // skip SSL verify if needed
curl_setopt($ch, CURLOPT_USERAGENT, "Mozilla/5.0");

$response = curl_exec($ch);
$http_code = curl_getinfo($ch, CURLINFO_HTTP_CODE);
curl_close($ch);

// Check if request was successful
if ($http_code == 200 && $response) {
    // Set correct header for RSS/XML
    header("Content-Type: application/rss+xml; charset=UTF-8");
    echo $response;
} else {
    header("Content-Type: text/plain");
    echo "Error: Unable to fetch RSS feed.";
}
?>
