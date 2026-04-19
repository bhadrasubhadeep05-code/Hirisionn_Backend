const Video = require("../models/Video.model");
const { deleteImageDirect } = require("./deleteImageController");
const ApiError = require("../utils/ApiError");

const deleteVideo = async (req, res, next) => {
    try {
        const { videoId } = req.params;
        
        if (!videoId) {
            return next(new ApiError(400, "Video ID is required"));
        }

        // Find video first
        const video = await Video.findById(videoId);
        if (!video) {
            return next(new ApiError(404, "Video not found"));
        }

        // Delete video from database
        await Video.findByIdAndDelete(videoId);

        return res.status(200).json({
            success: true,
            message: "Video deleted successfully"
        });

    } catch (error) {
        console.error("Error deleting video:", error);
        return next(new ApiError(500, "Failed to delete video", error));
    }
};

module.exports = { deleteVideo };