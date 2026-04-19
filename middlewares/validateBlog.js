 const  ApiError  = require( "../utils/ApiError.js");

const validateBlog = (req, res, next) => {
  const { title, content , thumbnail} = req.body;

  if (!title || typeof title !== "string") {
    throw new ApiError("Title is required", 400);
  }

  if (!content || typeof content !== "string") {
    throw new ApiError("Content is required", 400);
  }

  if (title.trim().length < 5) {
    throw new ApiError("Title must be at least 5 characters", 400);
  }
 

  next();
};


module.exports =  validateBlog;