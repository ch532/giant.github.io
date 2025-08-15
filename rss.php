<?php
header("Content-Type: application/rss+xml; charset=UTF-8");

// List of topics you want to show
$topics = [
    "entertainment",
    "sports",
    "technology",
    "business",
    "health",
    "science",
    "world news"
];

// Pick a random topic each time
$topic = $topics[array_rand($topics)];

// Build the Google News RSS feed URL for that topic
$rss_url = "https://news.google.com/rss/search?q=" . urlencode($topic) . "&hl=en&gl=US&ceid=US:en";

// Get the feed contents
$rss = @file_get_contents($rss_url);

// If it worked, output it; otherwise show error
if ($rss !== false) {
    echo $rss;
} else {
    echo "<?xml version=\"1.0\" encoding=\"UTF-8\"?><rss><channel><title>Error</title><description>Unable to fetch feed</description></channel></rss>";
}
?>
