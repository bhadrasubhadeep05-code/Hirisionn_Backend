const ApiError = require( "../utils/ApiError.js");


const validateVideo = (req, res, next) => {
  const { title, description } = req.body;

  if (!title || typeof title !== "string") {
    throw new ApiError("Title is required", 400);
  }

  if (!description || typeof description !== "string") {
    throw new ApiError("description is required", 400);
  }


  if (title.trim().length < 5) {
    throw new ApiError("Title must be at least 5 characters", 400);
  }

  next();
};
module.exports = validateVideo;