<?php
header("Content-Type: application/xml; charset=UTF-8");

$topic = isset($_GET['topic']) ? urlencode($_GET['topic']) : 'entertainment';
$url = "https://news.google.com/rss/search?q={$topic}&hl=en-NG&gl=NG&ceid=NG:en";

// Fetch RSS from Google
$ch = curl_init();
curl_setopt($ch, CURLOPT_URL, $url);
curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
curl_setopt($ch, CURLOPT_FOLLOWLOCATION, true);
$data = curl_exec($ch);
curl_close($ch);

echo $data;
