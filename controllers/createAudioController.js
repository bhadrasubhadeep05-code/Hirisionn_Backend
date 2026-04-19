const asyncHandler = require("../utils/asyncHandler");
const ApiError = require("../utils/ApiError");
const Audio = require("../models/Audio.model");

// Create Audio Controller
exports.createAudioCon = asyncHandler(async (req, res) => {
  const { title, description, youtubeLink, author, category } = req.body;

  // Validation
  if (!title || typeof title !== "string" || title.trim().length < 5) {
    throw new ApiError("Title is required and must be at least 5 characters", 400);
  }
  if (!description || typeof description !== "string") {
    throw new ApiError("Description is required", 400);
  }
  if (!youtubeLink || typeof youtubeLink !== "string") {
    throw new ApiError("Youtube link is required", 400);
  }
  if (!category || typeof category !== "string") {
    throw new ApiError("Category is required", 400);
  }

  const audio = await Audio.create({
    title,
    description,
    vid_link: youtubeLink,
    authorName: author || "Admin",
    category,
  });

  res.status(201).json({
    success: true,
    data: audio,
    message: "Audio created successfully!",
  });
});
