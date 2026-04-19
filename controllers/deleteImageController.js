const cloudinary = require("../config/cloudinary");
const asyncHandler = require("../utils/asyncHandler");
const ApiError = require("../utils/ApiError");

// For API route (POST request)
exports.deleteImage = asyncHandler( async (req, res) =>{
    const {public_id} = req.body;

    if(!public_id){
        throw new ApiError("public_id is required to delete image", 400);
    }

    const result = await cloudinary.uploader.destroy(public_id);

    if(result.result !== "ok"){
        throw new ApiError("Failed to delete item", 500);
    }

    res.status(200).json({
        success: true,
        message: "Image deleted successfully"
    });
});

// For direct function call from other controllers
exports.deleteImageDirect = async (public_id) => {
    if(!public_id) return false;
    
    try {
        const result = await cloudinary.uploader.destroy(public_id);
        return result.result === "ok";
    } catch (error) {
        console.error("Cloudinary delete error:", error);
        return false;
    }
};
