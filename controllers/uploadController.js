const cloudinary = require("../config/cloudinary");
const asyncHandler = require("../utils/asyncHandler");
const ApiError = require("../utils/ApiError");

exports.uploadImage = asyncHandler(async (req, res) =>{
    const {image} = req.body;

   if (!req.body?.image) {
  throw new ApiError("Image is required", 400);
}

   let result;
  try {
    result = await cloudinary.uploader.upload(image, {
      folder: "uploads",
      resource_type: "image",
    });
  } catch (err) {
    // normalize cloudinary error
    console.error("Cloudinary Error:", err);
    throw new ApiError("Cloudinary upload failed", 500);
  }

    if (!result || !result.secure_url || !result.public_id) {
  throw new ApiError("Image upload failed", 500);
}

    res.json({
        success: true,
        url: result.secure_url,
        public_id: result.public_id
    });
});