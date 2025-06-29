<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <title>Connect Gold - Offers</title>
  <style>
    body { font-family: Arial, sans-serif; margin: 20px; }
    header { background: #f9f9f9; padding: 10px 20px; border-bottom: 1px solid #ccc; }
    nav a { margin-right: 15px; text-decoration: none; color: #0073aa; }
    nav a:hover { text-decoration: underline; }
    .offers { margin-top: 30px; }
  </style>
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

  <div class="offers">
<?php
// Detect if user is inside Telegram app
$user_agent = $_SERVER['HTTP_USER_AGENT'];

if (strpos($user_agent, 'Telegram') !== false) {
    // ✅ Telegram-only offer feed
    $tracking_id = 'user@gmail.com'; // change this if needed
    $userip = $_SERVER['REMOTE_ADDR'];
    $max_offers = 10;

    $feedurl = 'https://www.cpagrip.com/common/offer_feed_rss.php?user_id=2410602&key=09d05f6413bec0a39584b6029a51c0f0&limit=' . $max_offers . '&ip=' . $userip . '&ua=' . urlencode($user_agent) . '&tracking_id=' . urlencode($tracking_id);

    $ch = curl_init();
    curl_setopt($ch, CURLOPT_URL, $feedurl);
    curl_setopt($ch, CURLOPT_HEADER, false);
    curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
    $output = curl_exec($ch);
    curl_close($ch);

    $xml = @simplexml_load_string($output);

    if ($xml !== false) {
        if (count($xml->offers->children()) == 0) {
            echo '<p>Sorry, no offers available in your region right now.</p>';
        } else {
            foreach ($xml->offers->offer as $offeritem) {
                $offeritem->offerlink = str_replace('www.cpagrip.com', 'filetrkr.com', $offeritem->offerlink);
                echo '<p><a target="_blank" href="' . $offeritem->offerlink . '">' . $offeritem->title . '</a></p>';
            }
        }
    } else {
        echo '<p>Error loading offers. Please try again later.</p>';
    }
} else {
    // ❌ Not Telegram user
    echo '<p style="color:red;">Offers are available exclusively inside the Telegram App. Please open this page from Telegram.</p>';
}
?>
  </div>

</body>
</html>
