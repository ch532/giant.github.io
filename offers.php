<?php
$tracking_id = 'user@gmail.com'; //This is used to track the user doing the offer. can be email, clickid, subid.. etc
$userip = $_SERVER['REMOTE_ADDR']; //We need to get the users ip, so the rss feed can display the correct offers for their country.
$user_agent = $_SERVER['HTTP_USER_AGENT']; //lets collect their user agent to pass along.
$max_offers = ; //max number of offers to display.


$feedurl = 'https://www.cpagrip.com/common/offer_feed_rss.php?user_id=2410602&key=09d05f6413bec0a39584b6029a51c0f0&limit='.$max_offers.'&ip='.$userip.'&ua='.urlencode($user_agent).'&tracking_id='.urlencode($tracking_id);

$ch = curl_init();
curl_setopt($ch, CURLOPT_URL, $feedurl);
curl_setopt($ch, CURLOPT_HEADER, false);
curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
// get the result of http query
$output = curl_exec($ch);
curl_close($ch);
$xml = @simplexml_load_string($output);

if($xml !== false) {
	foreach($xml->offers->offer as $offeritem) {

		//lets use a custom tracking domain for the links :)
		$offeritem->offerlink = str_replace('www.cpagrip.com','filetrkr.com',$offeritem->offerlink);
		
		//uncomment below if you want to display a point value.
		//$points = floatval($offeritem->payout) * 100; //lets make offers worth $1.20 appear as 120 points.
		//echo '<strong>Earn '.$points.' Points</strong><br/>';
		
		echo '<a target="_blank" href="'.$offeritem->offerlink.'">'.$offeritem->title.'</a><br/>';	
		
		//uncomment to show offers description
		//echo $offeritem->description.'<br/>';
		
		//uncomment to show offers image
		//echo '<img src="'.$offeritem->offerphoto.'">';

	}
	if(count($xml->offers->children())==0){
		echo 'Sorry there are no offers available for your region at this time.';
	}
}else{
	echo 'error fetching xml offer feed: '. $output;
}
?>
