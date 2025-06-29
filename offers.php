<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <title>Connect Gold - Offers</title>
</head>
<body>
  <header>
    <h1>Connect Gold</h1>
    <nav>
      <a href="index.html">Home</a>
      <a href="offers.php">Offers</a>
      <a href="buzz1.html">Buzz 1</a>
      <a href="buzz2.html">Buzz 2</a>
      <a href="buzz3.html">Buzz 3</a>
      <a href="buzz4.html">Buzz 4</a>
      <a href="testimonials.html">Testimonials</a>
      <a href="about.html">About</a>
      <a href="privacy.html">Privacy</a>
      <a href="contact.html">Contact</a>
      <a href="terms.html">Terms</a>
    </nav>
  </header>


<?php
$user_agent = $_SERVER['HTTP_USER_AGENT'];

if (strpos($user_agent, 'Telegram') !== false) {
    // ✅ Only runs when user is inside Telegram

    $tracking_id = 'user@gmail.com'; // Your tracking or user ID
    $userip = $_SERVER['REMOTE_ADDR'];
    $max_offers = 10; // Number of offers to show
    $feedurl = 'https://www.cpagrip.com/common/offer_feed_rss.php?user_id=2410602&key=09d05f6413bec0a39584b6029a51c0f0&limit='.$max_offers.'&ip='.$userip.'&ua='.urlencode($user_agent).'&tracking_id='.urlencode($tracking_id);

    $ch = curl_init();
    curl_setopt($ch, CURLOPT_URL, $feedurl);
    curl_setopt($ch, CURLOPT_HEADER, false);
    curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
    $output = curl_exec($ch);
    curl_close($ch);

    $xml = @simplexml_load_string($output);

    if ($xml !== false) {
        foreach ($xml->offers->offer as $offeritem) {
            $offeritem->offerlink = str_replace('www.cpagrip.com', 'filetrkr.com', $offeritem->offerlink);
            echo '<a target="_blank" href="'.$offeritem->offerlink.'">'.$offeritem->title.'</a><br/><br/>';
        }

        if (count($xml->offers->children()) == 0) {
            echo 'Sorry, no offers available for your region right now.';
        }
    } else {
        echo 'Error loading offers.';
    }
} else {
    // ❌ Not in Telegram
    echo 'Offers are available exclusively in the Telegram App.';
}
?>
