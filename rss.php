<?php
header("Content-Type: application/rss+xml; charset=UTF-8");

$topic = "entertainment,sports,news"; // Change to your preferred topic
$rss_url = "https://news.google.com/rss/search?q=" . urlencode($topic);

$rss = simplexml_load_file($rss_url);
if (!$rss) {
    die("<?xml version='1.0' encoding='UTF-8'?><rss><channel><title>Error</title></channel></rss>");
}

echo "<?xml version='1.0' encoding='UTF-8'?>";
?>
<rss version="2.0">
<channel>
    <title><?php echo ucfirst($topic); ?> News</title>
    <link>https://connectgold.sbs/</link>
    <description>Auto-updating <?php echo $topic; ?> news from Google News</description>

    <?php foreach ($rss->channel->item as $item): ?>
        <item>
            <title><![CDATA[<?php echo $item->title; ?>]]></title>
            <link><?php echo $item->link; ?></link>
            <description><![CDATA[<?php echo $item->description; ?>]]></description>
            <pubDate><?php echo $item->pubDate; ?></pubDate>
        </item>
    <?php endforeach; ?>
</channel>
</rss>
