const Video = require("../models/Video.model");
const ApiError = require("../utils/ApiError");
const asyncHandler = require("../utils/asyncHandler");

exports.createVideo = asyncHandler(async (req, res)=>{
  const {title, description, vid_link, category, subCategory} = req.body;
    console.log("heloo")
    const video = await Video.create({
        title,
        description,
        vid_link,
        category,
        subCategory
    });

    res.status(200).json({
        success: true,
        message: "video created successfully✅",
        data: video,
    });
});