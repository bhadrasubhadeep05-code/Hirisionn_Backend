const asyncHandler = require("../utils/asyncHandler");
const ApiError = require("../utils/ApiError");
const Video = require("../models/Video.model");

exports.getAllInterviewVideoCon = asyncHandler(async(req,res)=>{
    const page = parseInt(req.query.page) || 1;
    const limit = 10;
    const skip = (page - 1) * limit;

    const videos = await Video.find({category: "Interview Preparation"})
    .sort({createdAt: -1})
    .skip(skip)
    .limit(limit);

    const totalVideos = await Video.countDocuments({category: "Interview Preparation"});

    res.status(200).json(
        {
            success: true,
            page,
            data: videos,
            totalVideos,
            totalPages: Math.ceil(totalVideos / limit),
            count: videos.length,
        }
    );
});

exports.getAllIndustryVideoCon = asyncHandler(async(req,res)=>{
    const page = parseInt(req.query.page) || 1;
    const limit = 10;
    const skip = (page - 1) * limit;

    const videos = await Video.find({category: "Industry Updates"})
    .sort({createdAt: -1})
    .skip(skip)
    .limit(limit);

    const totalVideos = await Video.countDocuments({category: "Industry Updates"});

    res.status(200).json(
        {
            success: true,
            page,
            data: videos,
            totalVideos,
            totalPages: Math.ceil(totalVideos / limit),
            count: videos.length,
        }
    );
});

exports.getAllOtherVideosCon = asyncHandler(async(req,res)=>{
    const page = parseInt(req.query.page) || 1;
    const limit = 10;
    const skip = (page - 1) * limit;

    // Get all videos EXCEPT Interview Preparation and Industry Updates categories
    const videos = await Video.find({
        category: { 
            $nin: ["Interview Preparation", "Industry Updates"] 
        }
    })
    .sort({createdAt: -1})
    .skip(skip)
    .limit(limit);

    const totalVideos = await Video.countDocuments({
        category: { 
            $nin: ["Interview Preparation", "Industry Updates"] 
        }
    });

    res.status(200).json(
        {
            success: true,
            page,
            data: videos,
            totalVideos,
            totalPages: Math.ceil(totalVideos / limit),
            count: videos.length,
        }
    );
});
