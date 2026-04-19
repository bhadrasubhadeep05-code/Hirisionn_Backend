const Blog = require("../models/Blog.model");
const { deleteImageDirect } = require("./deleteImageController");
const ApiError = require("../utils/ApiError");

const deleteBlog = async (req, res, next) => {
    try {
        const { blogId } = req.params;
        
        if (!blogId) {
            return next(new ApiError(400, "Blog ID is required"));
        }

        // Find blog first
        const blog = await Blog.findById(blogId);
        if (!blog) {
            return next(new ApiError(404, "Blog not found"));
        }

        // Delete associated image from cloudinary if exists
        if (blog.image && blog.image.public_id) {
            await deleteImageDirect(blog.image.public_id);
        }

        // Delete blog from database
        await Blog.findByIdAndDelete(blogId);

        return res.status(200).json({
            success: true,
            message: "Blog deleted successfully"
        });

    } catch (error) {
        console.error("Error deleting blog:", error);
        return next(new ApiError(500, "Failed to delete blog", error));
    }
};

module.exports = { deleteBlog };