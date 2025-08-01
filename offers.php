<?php
// USER DATA
$ip = $_SERVER['REMOTE_ADDR'];
$ua = $_SERVER['HTTP_USER_AGENT'];
$ref = $_SERVER['HTTP_HOST'];
$kw = isset($_GET['kw']) ? urlencode($_GET['kw']) : '';

// ADFPOINT URL
$url = "http://adfpoint.com/api/v1/spx?authkey=LmIZ6MGYbPQlDW&subid=6cb811c3c37f8466e2bc75bac&fmt=xml&ua=$ua&ip=$ip&pagedomain=$ref&keywords=$kw";

// FETCH OFFER FEED
$xml = @simplexml_load_file($url);
if ($xml === false) {
    echo "❌ Failed to load offers.";
    exit;
}

// DISPLAY RESULTS
echo "<ul>";
foreach ($xml->offer as $offer) {
    $title = $offer->title;
    $link = $offer->link;
    echo "<li><a href='$link' target='_blank'>$title</a></li>";
}
echo "</ul>";
?>
