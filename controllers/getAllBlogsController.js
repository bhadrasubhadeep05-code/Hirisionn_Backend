const asyncHandler = require("../utils/asyncHandler");
const Blog = require("../models/Blog.model");

/**
 * @desc    Get all Blogs category 
 * @route   GET /api/blogs/blogs
 * @access  Public
 */
exports.getBlogsBlogCon = asyncHandler(async(req,res)=>{
    const page = parseInt(req.query.page) || 1;
    const limit = 10;
    const skip = (page - 1) * limit;

    const blogs = await Blog.find({ category: "Blog" })
    .sort({ createdAt: -1 })
    .skip(skip)
    .limit(limit);

    const totalBlogs = await Blog.countDocuments({ category: "Blog" });

    res.status(200).json({
        success: true,
        page,
        category: "Blogs (General Thought Leadership & Updates)",
        data: blogs,
        totalBlogs,
        totalPages: Math.ceil(totalBlogs / limit),
        count: blogs.length,
    });
});

/**
 * @desc    Get all Workforce Insights category Blogs
 * @route   GET /api/blogs/workforce-insights
 * @access  Public
 */
exports.getWorkforceInsightsBlogCon = asyncHandler(async(req,res)=>{
    const page = parseInt(req.query.page) || 1;
    const limit = 10;
    const skip = (page - 1) * limit;

    const blogs = await Blog.find({ category: "Marketing" })
    .sort({ createdAt: -1 })
    .skip(skip)
    .limit(limit);

    const totalBlogs = await Blog.countDocuments({ category: "Marketing" });

    res.status(200).json({
        success: true,
        page,
        category: "Workforce Insights (People, Hiring, Culture)",
        data: blogs,
        totalBlogs,
        totalPages: Math.ceil(totalBlogs / limit),
        count: blogs.length,
    });
});

/**
 * @desc    Get all Industry Insights category Blogs
 * @route   GET /api/blogs/industry-insights
 * @access  Public
 */
exports.getIndustryInsightsBlogCon = asyncHandler(async(req,res)=>{
    const page = parseInt(req.query.page) || 1;
    const limit = 10;
    const skip = (page - 1) * limit;

    const blogs = await Blog.find({ category: "Finance" })
    .sort({ createdAt: -1 })
    .skip(skip)
    .limit(limit);

    const totalBlogs = await Blog.countDocuments({ category: "Finance" });

    res.status(200).json({
        success: true,
        page,
        category: "Industry Insights (Market Trends & Analysis)",
        data: blogs,
        totalBlogs,
        totalPages: Math.ceil(totalBlogs / limit),
        count: blogs.length,
    });
});

exports.getBlogById = asyncHandler(async(req, res)=>{
     try {
    const { id } = req.params;

    // validation
    if (!id) {
      return res.status(400).json({
        success: false,
        message: "Blog ID is required",
      });
    }

    // find blog
    const blog = await Blog.findById(id);

    if (!blog) {
      return res.status(404).json({
        success: false,
        message: "Blog not found",
      });
    }

    return res.status(200).json({
      success: true,
      message: "Blog fetched successfully",
      blog,
    });
  } catch (error) {
    console.error("Get Blog By ID Error:", error);

    return res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }

})