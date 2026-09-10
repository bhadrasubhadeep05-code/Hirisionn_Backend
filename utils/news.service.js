const Parser = require("rss-parser");

const parser = new Parser();

exports.getBusinessNews = async () => {
  try {
    const response = await fetch("https://news.google.com/rss/search?q=business+India&hl=en-IN&gl=IN&ceid=IN:en");

    if (!response.ok) {
      throw new Error(
        `RSS feed request failed: ${response.status}`
      );
    }

    const xml = await response.text();

    const feed = await parser.parseString(xml);

    const news = feed.items.map((item) => ({
      id: item.guid || item.link,
      title: item.title || "",
      description: item.contentSnippet || item.content || "",
      image: item.enclosure?.url || null,
      url: item.link || "",
      publishedAt: item.isoDate || item.pubDate || null,
      author: item.creator || item.author || null,
      source: feed.title || "Business",
    }));

    return news;
  } catch (error) {
    console.error("Business news error:", error);
    throw error;
  }
};