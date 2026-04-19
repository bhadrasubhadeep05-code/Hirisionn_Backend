const asyncHandler = require("../utils/asyncHandler");
const ApiError = require("../utils/ApiError");
const Video = require("../models/Video.model");

exports.getLetastInterviewVideoCon = asyncHandler(async (req, res)=>{
    const video = await Video.find({category: "Interview Preparation"})
    .sort({createdAt: -1})
    .limit(3)
    .select("title thumbnail description vid_link category createdAt")
    .lean();

    res.status(200).json({
         success: true,
    count: video.length,
    data: video,
    });
});

exports.getLetastIndustryVideoCon = asyncHandler(async (req, res)=>{
    const video = await Video.find({category: "Industry Updates"})
    .sort({createdAt: -1})
    .limit(3)
    .select("title thumbnail description vid_link category createdAt")
    .lean();

    res.status(200).json({
         success: true,
    count: video.length,
    data: video,
    });
});