const ApiError = require("../utils/ApiError");

const validateAudio = (req, res, next) => {
  const { title, description, youtubeLink, author, category } = req.body;

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
  next();
};

module.exports = validateAudio;
