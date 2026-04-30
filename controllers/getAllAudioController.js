const asyncHandler = require("../utils/asyncHandler");
const Audio = require("../models/Audio.model");

/**
 * @desc    Get all  category Audio
 * @route   GET /api/audio
 * @access  Public
 */
exports.getAudioCon = asyncHandler(async(req,res)=>{
    const page = parseInt(req.query.page) || 1;
    const limit = 10;
    const skip = (page - 1) * limit;

    const audios = await Audio.find({ category: "Audio" })
    .sort({ createdAt: -1 })
    .skip(skip)
    .limit(limit);

    const totalAudios = await Audio.countDocuments({ category: "Audio" });

    res.status(200).json({
        success: true,
        page,
        category: "Audio (General Thought Leadership & Updates)",
        data: audios,
        totalAudios,
        totalPages: Math.ceil(totalAudios / limit),
        count: audios.length,
    });
});

/**
 * @desc    Get all Workforce Insights category Audio
 * @route   GET /api/audio/workforce-insights
 * @access  Public
 */
exports.getWorkforceInsightsAudioCon = asyncHandler(async(req,res)=>{
    const page = parseInt(req.query.page) || 1;
    const limit = 10;
    const skip = (page - 1) * limit;

    const audios = await Audio.find({ category: "Marketing" })
    .sort({ createdAt: -1 })
    .skip(skip)
    .limit(limit);

    const totalAudios = await Audio.countDocuments({ category: "Marketing" });

    res.status(200).json({
        success: true,
        page,
        category: "Workforce Insights (People, Hiring, Culture)",
        data: audios,
        totalAudios,
        totalPages: Math.ceil(totalAudios / limit),
        count: audios.length,
    });
});

/**
 * @desc    Get all Industry Insights category Audio
 * @route   GET /api/audio/industry-insights
 * @access  Public
 */
exports.getIndustryInsightsAudioCon = asyncHandler(async(req,res)=>{
    const page = parseInt(req.query.page) || 1;
    const limit = 10;
    const skip = (page - 1) * limit;

    const audios = await Audio.find({ category: "Finance" })
    .sort({ createdAt: -1 })
    .skip(skip)
    .limit(limit);

    const totalAudios = await Audio.countDocuments({ category: "Finance" });

    res.status(200).json({
        success: true,
        page,
        category: "Industry Insights (Market Trends & Analysis)",
        data: audios,
        totalAudios,
        totalPages: Math.ceil(totalAudios / limit),
        count: audios.length,
    });
});