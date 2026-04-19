const Audio = require("../models/Audio.model");
const { deleteImageDirect } = require("./deleteImageController");
const ApiError = require("../utils/ApiError");

const deleteVideo = async (req, res, next) => {
    try {
        const { audioId } = req.params;
        
        if (!audioId) {
            return next(new ApiError("Audio ID is required", 400));
        }

        // Find video first
        const audio = await Audio.findById(videoId);
        if (!audio) {
            return next(new ApiError( "Audio not found", 404));
        }

        // Delete video from database
        await Audio.findByIdAndDelete(audioId);

        return res.status(200).json({
            success: true,
            message: "Audio deleted successfully"
        });

    } catch (error) {
        console.error("Error deleting video:", error);
        return next(new ApiError( "Failed to delete video", 500, error));
    }
};