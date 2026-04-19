const User = require('../models/User.model.js');
const cloudinary = require('cloudinary').v2;
const ApiResponse = require('../utils/ApiResponse.js');
const ApiError = require('../utils/ApiError.js');
const asyncHandler = require('../utils/asyncHandler.js');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const fetch = require('node-fetch');

const generateToken = (userId) => {
  return jwt.sign(
    { _id: userId },
    process.env.JWT_SECRET,
    { expiresIn: "7d" }
  );
};

// @desc    Admin Login
// @route   POST /api/admin/loginAdmin
// @access  Public

const loginAdmin = asyncHandler(async (req, res) => {
  const { phoneNo, password } = req.body;

  const user = await User.findOne({ phoneNo });

  if (!user) {
    throw new ApiError("User not found", 409);
  }

  const isMatch = await bcrypt.compare(password, user.password);

  if (!isMatch) {
    return res.json({
      succes:false,
      message: "Incorect Password"
    })
  }

  const adminToken = generateToken(user._id);

  return res.json({
    adminToken,
    succes: true,
  });
});


// @desc    Get all users sorted by downloaded status (undownloaded first)
// @route   GET /api/admin/users
// @access  Private/Admin
const getAllUsers = asyncHandler(async (req, res) => {
    const users = await User.find()
        .select('-password -securityQuestions')
        .sort({ downloaded: 1, createdAt: -1 });

    res.status(200).json(new ApiResponse(200, users, "Users fetched successfully"));
});

const downloadUserResume = asyncHandler(async (req, res) => {
  const userId = req.params.id.trim().replace(/[^a-fA-F0-9]/g, "");

  if (!userId.match(/^[a-fA-F0-9]{24}$/)) {
    throw new ApiError("Invalid user ID format", 400);
  }

  const user = await User.findById(userId);

  if (!user) {
    throw new ApiError("User not found", 404);
  }

  if (
    !user.profile ||
    !user.profile.resume ||
    !user.profile.resume.url ||
    !user.profile.resume.public_id
  ) {
    throw new ApiError("Resume not found for this user", 404);
  }

  const resume = user.profile.resume;
  let fileBuffer;

  /*
   -----------------------------------
   STEP 1: FETCH FILE FROM CLOUDINARY
   -----------------------------------
  */
  try {
    const signedDownloadUrl = cloudinary.utils.private_download_url(
      resume.public_id,
      "pdf",
      {
        resource_type: "image",
        type: "upload",
        expires_at: Math.floor(Date.now() / 1000) + 300,
      }
    );

    const fileResponse = await fetch(signedDownloadUrl);

    if (!fileResponse.ok) {
      console.error("Cloudinary fetch failed:", fileResponse.status);
      throw new ApiError("Resume file is no longer available on server", 404);
    }

    fileBuffer = Buffer.from(await fileResponse.arrayBuffer());

  } catch (error) {
    console.error("Resume fetch error:", error.message);
    throw new ApiError("Failed to fetch resume file", 500);
  }

  /*
   -----------------------------------
   STEP 2: DELETE FROM CLOUDINARY
   -----------------------------------
  */
  try {
    const deleteResult = await cloudinary.uploader.destroy(
      resume.public_id,
      {
        resource_type: "image"
      }
    );

    console.log("Cloudinary delete result:", deleteResult);

    if (deleteResult.result !== "ok") {
      throw new Error("Cloudinary deletion failed");
    }

  } catch (error) {
    console.error("Cloudinary deletion error:", error.message);
    throw new ApiError("Failed to delete resume from Cloudinary", 500);
  }

  /*
   -----------------------------------
   STEP 3: REMOVE FROM MONGODB
   -----------------------------------
  */
  user.downloaded = true;
  user.profile.resume = null;
  await user.save();

  /*
   -----------------------------------
   STEP 4: SEND FILE TO FRONTEND
   -----------------------------------
  */
  const safeName = user.fullName
    ? user.fullName.replace(/\s+/g, "-")
    : "resume";

  res.setHeader("Content-Type", "application/pdf");
  res.setHeader(
    "Content-Disposition",
    `attachment; filename=${safeName}.pdf`
  );

  return res.status(200).send(fileBuffer);
});

// @desc    Export all users to CSV
// @route   GET /api/admin/users/export/csv
// @access  Private/Admin
const exportUsersCSV = asyncHandler(async (req, res) => {
    const users = await User.find()
        .select('-password -securityQuestions')
        .sort({ downloaded: 1, createdAt: -1 });

    // Create CSV content
    const headers = ['ID', 'Full Name', 'Email', 'Phone', 'Experience Level', 'Job', 'Employer', 'Current CTC', 'Course', 'Domain', 'Education', 'LinkedIn', 'Profile Complete', 'Downloaded', 'Created At'];
    
    const csvRows = [headers.join(',')];

    users.forEach(user => {
        const row = [
            user._id,
            `"${user.fullName}"`,
            user.email,
            user.phoneNo,
            user.profile?.experienceLevel || '',
            user.profile?.job || '',
            user.profile?.employer || '',
            user.profile?.currentCTC || '',
            user.profile?.course || '',
            user.profile?.domain || '',
            user.profile?.education || '',
            user.profile?.linkedin || '',
            user.isProfileComplete,
            user.downloaded,
            user.createdAt.toISOString()
        ];
        csvRows.push(row.join(','));
    });

    const csvContent = csvRows.join('\n');

    res.setHeader('Content-Type', 'text/csv');
    res.setHeader('Content-Disposition', `attachment; filename=users-export-${new Date().toISOString().split('T')[0]}.csv`);
    
    res.status(200).send(csvContent);
});

// @desc    Export only new users (after last download timestamp) to CSV
// @route   GET /api/admin/users/export/csv/new
// @access  Private/Admin
const exportNewUsersCSV = asyncHandler(async (req, res) => {
    const { lastDownloadTimestamp } = req.query;

    let query = { downloaded: false };
    
    if (lastDownloadTimestamp) {
        query.createdAt = { $gt: new Date(lastDownloadTimestamp) };
    }

    const users = await User.find(query)
        .select('-password -securityQuestions')
        .sort({ createdAt: -1 });

    // Create CSV content
    const headers = ['ID', 'Full Name', 'Email', 'Phone', 'Experience Level', 'Job', 'Employer', 'Current CTC', 'Course', 'Domain', 'Education', 'LinkedIn', 'Profile Complete', 'Created At'];
    
    const csvRows = [headers.join(',')];

    users.forEach(user => {
        const row = [
            user._id,
            `"${user.fullName}"`,
            user.email,
            user.phoneNo,
            user.profile?.experienceLevel || '',
            user.profile?.job || '',
            user.profile?.employer || '',
            user.profile?.currentCTC || '',
            user.profile?.course || '',
            user.profile?.domain || '',
            user.profile?.education || '',
            user.profile?.linkedin || '',
            user.isProfileComplete,
            user.createdAt.toISOString()
        ];
        csvRows.push(row.join(','));
    });

     const csvContent = csvRows.join('\n');

    // Mark these users as downloaded
    await User.updateMany({ _id: { $in: users.map(u => u._id) } }, { downloaded: true });

    res.setHeader('Content-Type', 'text/csv');
    res.setHeader('Content-Disposition', `attachment; filename=new-users-export-${new Date().toISOString().split('T')[0]}.csv`);
    
    res.status(200).send(csvContent);
});

// @desc    Get stats for admin dashboard
// @route   GET /api/admin/users/stats
// @access  Private/Admin
const getUserStats = asyncHandler(async (req, res) => {
    const totalUsers = await User.countDocuments();
    const downloadedUsers = await User.countDocuments({ downloaded: true });
    const pendingUsers = await User.countDocuments({ downloaded: false });
    const completeProfiles = await User.countDocuments({ isProfileComplete: true });

    res.status(200).json(new ApiResponse(200, {
        totalUsers,
        downloadedUsers,
        pendingUsers,
        completeProfiles
    }, "Stats fetched successfully"));
});

module.exports = {
    loginAdmin,
    getAllUsers,
    downloadUserResume,
    exportUsersCSV,
    exportNewUsersCSV,
    getUserStats
};
