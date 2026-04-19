const asyncHandler = require("../utils/asyncHandler");
const ApiError = require("../utils/ApiError");
const Audio = require("../models/Audio.model");

exports.getAllInterviewAudioCon = asyncHandler(async(req,res)=>{
    const page = parseInt(req.query.page) || 1;
    const limit = 10;
    const skip = (page - 1) * limit;

    const audios = await Audio.find({category: "Interview Preparation"})
    .sort({createdAt: -1})
    .skip(skip)
    .limit(limit);

    const totalAudios = await Audio.countDocuments({category: "Interview Preparation"});

    res.status(200).json(
        {
            success: true,
            page,
            data: audios,
            totalAudios,
            totalPages: Math.ceil(totalAudios / limit),
            count: audios.length,
        }
    );
});

exports.getAllIndustryAudioCon = asyncHandler(async(req,res)=>{
    const page = parseInt(req.query.page) || 1;
    const limit = 10;
    const skip = (page - 1) * limit;

    const audios = await Audio.find({category: "Industry Updates"})
    .sort({createdAt: -1})
    .skip(skip)
    .limit(limit);

    const totalAudios = await Audio.countDocuments({category: "Industry Updates"});

    res.status(200).json(
        {
            success: true,
            page,
            data: audios,
            totalAudios,
            totalPages: Math.ceil(totalAudios / limit),
            count: audios.length,
        }
    );
});

exports.getAllOtherAudiosCon = asyncHandler(async(req,res)=>{
    const page = parseInt(req.query.page) || 1;
    const limit = 10;
    const skip = (page - 1) * limit;

    // Get all audios EXCEPT Interview Preparation and Industry Updates categories
    const audios = await Audio.find({
        category: { 
            $nin: ["Interview Preparation", "Industry Updates"] 
        }
    })
    .sort({createdAt: -1})
    .skip(skip)
    .limit(limit);

    const totalAudios = await Audio.countDocuments({
        category: { 
            $nin: ["Interview Preparation", "Industry Updates"] 
        }
    });

    res.status(200).json(
        {
            success: true,
            page,
            data: audios,
            totalAudios,
            totalPages: Math.ceil(totalAudios / limit),
            count: audios.length,
        }
    );
});