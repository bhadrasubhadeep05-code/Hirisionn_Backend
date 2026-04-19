const asyncHandler = require("../utils/asyncHandler");
const ApiError = require("../utils/ApiError");
const Blog = require("../models/Blog.model");

exports.getAllInterviewBlogCon = asyncHandler(async(req,res)=>{
    const page = parseInt(req.query.page) || 1;
    const limit = 10;
    const skip = (page - 1) * limit;

    const blogs = await Blog.find({category: "Interview Preparation"})
    .sort({createdAt: -1})
    .skip(skip)
    .limit(limit);

    const totalBlogs = await Blog.countDocuments({
    category: "Interview Preparation",
  });

    res.status(200).json(
        {
            success: true,
            page,
            data: blogs,
            totalBlogs,
            totalPages: Math.ceil(totalBlogs / limit),
            count: blogs.length,
        }
    );
});

exports.getAllIndustryBlogCon = asyncHandler(async(req,res)=>{
    const page = parseInt(req.query.page) || 1;
    const limit = 10;
    const skip = (page - 1) * limit;

    const blogs = await Blog.find({category: "Industry Updates"})
    .sort({createdAt: -1})
    .skip(skip)
    .limit(limit);

    const totalBlogs = await Blog.countDocuments({
        category: "Industry Updates"
    });

    res.status(200).json(
        {
            success: true,
            page,
            data: blogs,
            totalBlogs,
            totalPages: Math.ceil(totalBlogs / limit),
            count: blogs.length,
        }
    );
});

exports.getAllOtherBlogsCon = asyncHandler(async(req,res)=>{
    const page = parseInt(req.query.page) || 1;
    const limit = 10;
    const skip = (page - 1) * limit;

    // Get all blogs EXCEPT Interview Preparation and Industry Updates categories
    const blogs = await Blog.find({
        category: { 
            $nin: ["Interview Preparation", "Industry Updates"] 
        }
    })
    .sort({createdAt: -1})
    .skip(skip)
    .limit(limit);

    const totalBlogs = await Blog.countDocuments({
        category: { 
            $nin: ["Interview Preparation", "Industry Updates"] 
        }
    });

    res.status(200).json(
        {
            success: true,
            page,
            data: blogs,
            totalBlogs,
            totalPages: Math.ceil(totalBlogs / limit),
            count: blogs.length,
        }
    );
});
