const cloudinary = require("cloudinary").v2;
const ApiError = require("../utils/ApiError");

const uploadOnCloudinary = async (file) => {
  try {
    if (!file) return null;


   const response = await cloudinary.uploader.upload(file, {
  resource_type: "auto",
  folder: "resumes",
  use_filename: true,
});
const downloadUrl = cloudinary.url(response.public_id, {
    resource_type: "image",
  type: "upload",
  flags: "attachment",
  });
    return {
  url: response.secure_url,
  public_id: response.public_id,
  download_link: downloadUrl
};
  } catch (error) {
    console.error("Cloudinary Error:", error); // ✅ fixed
    throw new ApiError("Cloudinary upload failed", 500);
  }
};

const deleteFromCloudinary = async (publicId) => {
  try {
    if (!publicId) return;
    
    await cloudinary.uploader.destroy(publicId, {
      resource_type: "image"
    });
    
    console.log("✅ Old resume deleted from Cloudinary:", publicId);
  } catch (error) {
    console.error("❌ Failed to delete old resume:", error);
    // Don't throw error - continue even if delete fails
  }
};

module.exports = { uploadOnCloudinary, deleteFromCloudinary };
