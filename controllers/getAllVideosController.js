const asyncHandler = require("../utils/asyncHandler");
const Video = require("../models/Video.model");

/**
 * @desc    Get all  category Videos
 * @route   GET /api/videos/blogs
 * @access  Public
 */
exports.getVideoCon = asyncHandler(async(req,res)=>{
    const page = parseInt(req.query.page) || 1;
    const limit = 10;
    const skip = (page - 1) * limit;

    const videos = await Video.find({ category: "Video" })
    .sort({ createdAt: -1 })
    .skip(skip)
    .limit(limit);

    const totalVideos = await Video.countDocuments({ category: "Video" });

    res.status(200).json({
        success: true,
        page,
        category: "Video (General Thought Leadership & Updates)",
        data: videos,
        totalVideos,
        totalPages: Math.ceil(totalVideos / limit),
        count: videos.length,
    });
});

/**
 * @desc    Get all Workforce Insights category Videos
 * @route   GET /api/videos/workforce-insights
 * @access  Public
 */
exports.getWorkforceInsightsVideoCon = asyncHandler(async(req,res)=>{
    const page = parseInt(req.query.page) || 1;
    const limit = 10;
    const skip = (page - 1) * limit;

    const videos = await Video.find({ category: "Marketing" })
    .sort({ createdAt: -1 })
    .skip(skip)
    .limit(limit);

    const totalVideos = await Video.countDocuments({ category: "Marketing" });

    res.status(200).json({
        success: true,
        page,
        category: "Workforce Insights (People, Hiring, Culture)",
        data: videos,
        totalVideos,
        totalPages: Math.ceil(totalVideos / limit),
        count: videos.length,
    });
});

/**
 * @desc    Get all Industry Insights category Videos
 * @route   GET /api/videos/industry-insights
 * @access  Public
 */
exports.getIndustryInsightsVideoCon = asyncHandler(async(req,res)=>{
    const page = parseInt(req.query.page) || 1;
    const limit = 10;
    const skip = (page - 1) * limit;

    const videos = await Video.find({ category: "Finance" })
    .sort({ createdAt: -1 })
    .skip(skip)
    .limit(limit);

    const totalVideos = await Video.countDocuments({ category: "Finance" });

    res.status(200).json({
        success: true,
        page,
        category: "Industry Insights (Market Trends & Analysis)",
        data: videos,
        totalVideos,
        totalPages: Math.ceil(totalVideos / limit),
        count: videos.length,
    });
});