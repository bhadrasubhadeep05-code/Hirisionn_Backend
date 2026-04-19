const asyncHandler = require("../utils/asyncHandler");
const ApiError = require("../utils/ApiError");
const Blog = require("../models/Blog.model")

exports.getLetastInterviewBlogCon = asyncHandler(async (req, res)=>{
    const blogs = await Blog.find({category: "Interview Preparation"})
    .sort({createdAt: -1})
    .limit(4)
    .select("title thumbnail content authorName category createdAt")
    .lean();

    res.status(200).json({
         success: true,
    count: blogs.length,
    data: blogs,
    });
});

exports.getLetastIndustryBlogCon = asyncHandler(async (req, res)=>{
    const blogs = await Blog.find({category: "Industry Updates"})
    .sort({createdAt: -1})
    .limit(4)
    .select("title thumbnail content authorName category createdAt")
    .lean();

    res.status(200).json({
         success: true,
    count: blogs.length,
    data: blogs,
    });
});