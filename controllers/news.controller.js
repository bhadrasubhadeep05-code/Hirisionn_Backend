const { getBusinessNews }= require("../utils/news.service");

exports.getBusinessNewsController = async (req, res) => {
  try {
    const news = await getBusinessNews();

    res.status(200).json({
      success: true,
      count: news.length,
      news,
    });
  } catch (error) {
    console.error("Business news error:", error);

    res.status(500).json({
      success: false,
      message: "Failed to fetch business news",
    });
  }
};