

exports.getBusinessNews = async () => {
  const response = await fetch(process.env.NEWS_FEED_URL);
 
  if (!response.ok) {
    throw new Error(
      `RSS feed request failed: ${response.status}`
    );
  }

  const feed = await response.json();

  const news = feed.items.map((item) => ({
    id: item.id,
    title: item.title,
    description: item.content_text || "",
    image: item.image || null,
    url: item.url,
    publishedAt: item.date_published || null,
    author: item.authors?.[0]?.name || null,
    source: feed.title || "Business",
  }));

  return news;
};