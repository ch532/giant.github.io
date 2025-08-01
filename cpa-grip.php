<?php
$tracking_id = 'user@gmail.com'; // Can be email, click ID, etc.
$userip = $_SERVER['REMOTE_ADDR']; // Get visitor IP
$user_agent = $_SERVER['HTTP_USER_AGENT']; // Get user agent
$max_offers = 10; // Number of offers to display

$feedurl = 'https://www.cpagrip.com/common/offer_feed_rss.php?user_id=2410602&key=09d05f6413bec0a39584b6029a51c0f0'
          . '&limit=' . $max_offers
          . '&ip=' . $userip
          . '&ua=' . urlencode($user_agent)
          . '&tracking_id=' . urlencode($tracking_id);

// Initialize curl
$ch = curl_init();
curl_setopt($ch, CURLOPT_URL, $feedurl);
curl_setopt($ch, CURLOPT_HEADER, false);
curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
$output = curl_exec($ch);
curl_close($ch);

// Parse XML response
$xml = @simplexml_load_string($output);

if ($xml !== false) {
    if (count($xml->offers->children()) > 0) {
        foreach ($xml->offers->offer as $offeritem) {
            // Optional: Replace domain for tracking
            $offeritem->offerlink = str_replace('www.cpagrip.com', 'filetrkr.com', $offeritem->offerlink);
            
            // Display offer title with link
            echo '<a target="_blank" href="' . $offeritem->offerlink . '">' . htmlspecialchars($offeritem->title) . '</a><br>';

            // Optional: show image
            // echo '<img src="' . $offeritem->offerphoto . '" alt="" style="max-width:100px;"><br>';

            // Optional: show description
            // echo '<p>' . htmlspecialchars($offeritem->description) . '</p><br>';

            // Optional: show points
            // $points = floatval($offeritem->payout) * 100;
            // echo '<strong>Earn ' . $points . ' Points</strong><br><br>';
        }
    } else {
        echo 'Sorry, there are no offers available for your region at this time.';
    }
} else {
    echo 'Error fetching XML offer feed: ' . $output;
}
?>
