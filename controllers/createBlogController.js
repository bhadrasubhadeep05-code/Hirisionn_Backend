const Blog = require("../models/Blog.model");
const ApiError = require("../utils/ApiError");
const asyncHandler = require("../utils/asyncHandler");

 exports.createBlog = asyncHandler(async (req, res)=>{
  const {title, content, category, authorName, thumbnail} = req.body;

    const blog = await Blog.create({
        title,
        content,
        authorName,
        category,
        thumbnail,
    });

    res.status(200).json({
        success: true,
        message: "Blog created successfully✅",
        data: blog,
    });
});