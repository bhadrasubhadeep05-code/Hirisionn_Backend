const User = require("../models/User.model.js");
const cloudinary = require("cloudinary").v2;
const ApiResponse = require("../utils/ApiResponse.js");
const ApiError = require("../utils/ApiError.js");
const asyncHandler = require("../utils/asyncHandler.js");
const jwt = require("jsonwebtoken");
const bcrypt = require("bcryptjs");

const generateToken = (userId) => {
  return jwt.sign({ _id: userId }, process.env.JWT_SECRET, {
    expiresIn: "7d",
  });
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
      succes: false,
      message: "Incorect Password",
    });
  }

  const adminToken = generateToken(user._id);

  if (process.env.NODE_ENV === "production") {
    res.cookie("token", adminToken, {
      httpOnly: true,
      secure: true,
      sameSite: "None",
      maxAge: 7 * 24 * 60 * 60 * 1000,
    });
  }

  return res.json({
    adminToken,
    succes: true,
  });
});

const logoutAdmin = asyncHandler(async (req, res) => {
  res.clearCookie("token", {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "None",
  });

  return res.status(200).json({
    success: true,
    message: "Admin logged out successfully",
  });
});

// @desc    Get all users sorted by downloaded status (undownloaded first)
// @route   GET /api/admin/users
// @access  Private/Admin
const getAllUsers = asyncHandler(async (req, res) => {
  const users = await User.find()
    .select("-password -securityQuestions")
    .sort({ downloaded: 1, createdAt: -1 });

  res
    .status(200)
    .json(new ApiResponse(200, users, "Users fetched successfully"));
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
      },
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
    const deleteResult = await cloudinary.uploader.destroy(resume.public_id, {
      resource_type: "image",
    });

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
  res.setHeader("Content-Disposition", `attachment; filename=${safeName}.pdf`);

  return res.status(200).send(fileBuffer);
});

// @desc    Export all users to CSV
// @route   GET /api/admin/users/export/csv
// @access  Private/Admin
const exportUsersCSV = asyncHandler(async (req, res) => {
  const users = await User.find()
    .select("-password -securityQuestions")
    .sort({ downloaded: 1, createdAt: -1 });

  // Create CSV content
  const headers = [
    "ID",
    "Full Name",
    "Email",
    "Phone",
    "Experience Level",
    "Job",
    "Employer",
    "Current CTC",
    "Course",
    "Domain",
    "Education",
    "LinkedIn",
    "Profile Complete",
    "Downloaded",
    "Created At",
  ];

  const csvRows = [headers.join(",")];

  users.forEach((user) => {
    const row = [
      user._id,
      `"${user.fullName}"`,
      user.email,
      user.phoneNo,
      user.profile?.experienceLevel || "",
      user.profile?.job || "",
      user.profile?.employer || "",
      user.profile?.currentCTC || "",
      user.profile?.course || "",
      user.profile?.domain || "",
      user.profile?.education || "",
      user.profile?.linkedin || "",
      user.isProfileComplete,
      user.downloaded,
      user.createdAt.toISOString(),
    ];
    csvRows.push(row.join(","));
  });

  const csvContent = csvRows.join("\n");

  res.setHeader("Content-Type", "text/csv");
  res.setHeader(
    "Content-Disposition",
    `attachment; filename=users-export-${new Date().toISOString().split("T")[0]}.csv`,
  );

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
    .select("-password -securityQuestions")
    .sort({ createdAt: -1 });

  // Create CSV content
  const headers = [
    "ID",
    "Full Name",
    "Email",
    "Phone",
    "Experience Level",
    "Job",
    "Employer",
    "Current CTC",
    "Course",
    "Domain",
    "Education",
    "LinkedIn",
    "Profile Complete",
    "Created At",
  ];

  const csvRows = [headers.join(",")];

  users.forEach((user) => {
    const row = [
      user._id,
      `"${user.fullName}"`,
      user.email,
      user.phoneNo,
      user.profile?.experienceLevel || "",
      user.profile?.job || "",
      user.profile?.employer || "",
      user.profile?.currentCTC || "",
      user.profile?.course || "",
      user.profile?.domain || "",
      user.profile?.education || "",
      user.profile?.linkedin || "",
      user.isProfileComplete,
      user.createdAt.toISOString(),
    ];
    csvRows.push(row.join(","));
  });

  const csvContent = csvRows.join("\n");

  // Mark these users as downloaded
  await User.updateMany(
    { _id: { $in: users.map((u) => u._id) } },
    { downloaded: true },
  );

  res.setHeader("Content-Type", "text/csv");
  res.setHeader(
    "Content-Disposition",
    `attachment; filename=new-users-export-${new Date().toISOString().split("T")[0]}.csv`,
  );

  res.status(200).send(csvContent);
});

// @desc    Get stats for admin dashboard
// @route   GET /api/admin/users/stats
// @access  Private/Admin
const getUserStats = asyncHandler(async (req, res) => {
  const totalUsers = await User.countDocuments();
  const downloadedUsers = await User.countDocuments({ downloaded: true });
  const pendingUsers = await User.countDocuments({ downloaded: false });
  const completeProfiles = await User.countDocuments({
    isProfileComplete: true,
  });

  res.status(200).json(
    new ApiResponse(
      200,
      {
        totalUsers,
        downloadedUsers,
        pendingUsers,
        completeProfiles,
      },
      "Stats fetched successfully",
    ),
  );
});

// @desc    Get all internship applicants
// @route   GET /api/admin/internship-applicants
// @access  Private/Admin
const getInternshipApplicants = asyncHandler(async (req, res) => {
  try {
    // Get all users that have internship interests
    const users = await User.find(
      {
        internshipInterests: {
          $elemMatch: {
            status: "Applied",
          },
        },
      },
      "fullName email internshipInterests",
    );

    res.status(200).json({ success: true, users });
  } catch (error) {
    console.error("Fetch applicants error:", error);
    res
      .status(500)
      .json({ success: false, message: "Failed to fetch applicants" });
  }
});

// @desc    Get all internship applicants fulfield
// @route   GET /api/admin/internship-applicants
// @access  Private/Admin
const getInternshipFulFilled = asyncHandler(async (req, res) => {
  try {
    // Get all users that have internship interests
    const users = await User.find(
      {
        internshipInterests: {
          $elemMatch: {
            status: "Fulfilled",
          },
        },
      },
      "fullName email internshipInterests",
    );

    res.status(200).json({ success: true, users });
  } catch (error) {
    console.error("Fetch applicants error:", error);
    res
      .status(500)
      .json({ success: false, message: "Failed to fetch applicants" });
  }
});

// @desc   Update internship applicants status
// @route   put /api/admin/internship-fulfilled
// @access  Private/Admin
 const markInternshipAsFulfilled = async (req, res) => {
  try {
    const { userId, category, subCategory } = req.body;

    // Required validation
    if (!userId || !category) {
      return res.status(400).json({
        success: false,
        message: "userId and category are required",
      });
    }

    // Find user
    const user = await User.findById(userId);

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    // Find matching internship
    const internship = user.internshipInterests.find((item) => {
      const categoryMatch = item.category === category;

      // if subCategory is provided, match both
      if (subCategory) {
        return categoryMatch && item.subCategory === subCategory;
      }

      // otherwise only category match
      return categoryMatch;
    });

    if (!internship) {
      return res.status(404).json({
        success: false,
        message: "Internship application not found",
      });
    }

    // Prevent duplicate update
    if (internship.status === "Fulfilled") {
      return res.status(400).json({
        success: false,
        message: "Internship is already marked as Fulfilled",
      });
    }

    // Update status
    internship.status = "Fulfilled";

    await user.save();

    return res.status(200).json({
      success: true,
      message: "Internship status updated to Fulfilled",
      updatedInternship: internship,
    });
  } catch (error) {
    console.error("Mark internship fulfilled error:", error);

    return res.status(500).json({
      success: false,
      message: "Failed to update internship status",
      error: error.message,
    });
  }
};

// ===============================
// SET Job Placement Applied Status
// ===============================

 const updateJobPlacementStatus = async (req, res) => {
  try {
    const {  applied } = req.body;

    // Validation
    if ( typeof applied !== "boolean") {
      return res.status(400).json({
        success: false,
        message: "applied(boolean) are required",
      });
    }

    // Find user
    const user = await User.findById(req.user._id);

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }
    if(user.jobPlacement.applied === true){
      return res.status(400).json({
        success: false,
        message: "Already Applied"
      })
    }

    // Update job placement status
    user.jobPlacement.applied = applied;
    user.jobPlacement.status = "Applied"

    // Optional: update appliedAt only when applying
    if (applied) {
      user.jobPlacement.appliedAt = new Date();
    }

    await user.save();

    return res.status(200).json({
      success: true,
      message: "Applied for job placement",
      jobPlacement: user.jobPlacement,
    });
  } catch (error) {
    console.error("Update job placement error:", error);

    return res.status(500).json({
      success: false,
      message: "Failed to update job placement status",
      error: error.message,
    });
  }
};


// ===============================
// GET Job Placement Status
// ===============================

  const getJobPlacementStatus = async (req, res) => {
  try {
    // Find users where jobPlacement.applied = true
    const users = await User.find(
      {
        "jobPlacement.applied": true
      },
      "fullName email phoneNo  jobPlacement"
    );

    return res.status(200).json({
      success: true,
      count: users.length,
      users
    });
  } catch (error) {
    console.error("Get applied job placement users error:", error);

    return res.status(500).json({
      success: false,
      message: "Failed to fetch applied job placement users",
      error: error.message
    });
  }
};


 //Updating JobPlacement
 const markJobPlacementAsFulfilled = async (req, res) => {
  try {
    const { userId } = req.body;

    // Validation
    if (!userId) {
      return res.status(400).json({
        success: false,
        message: "userId is required",
      });
    }

    // Find user
    const user = await User.findById(userId);

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    // Check if user has applied
    if (!user.jobPlacement.applied) {
      return res.status(400).json({
        success: false,
        message: "User has not applied for Job Placement",
      });
    }

    // Prevent duplicate update
    if (user.jobPlacement.status === "Fulfilled") {
      return res.status(400).json({
        success: false,
        message: "Job Placement is already marked as Fulfilled",
      });
    }

    // Update status
    user.jobPlacement.status = "Fulfilled";

    await user.save();

    return res.status(200).json({
      success: true,
      message: "Job Placement status updated to Fulfilled",
      jobPlacement: user.jobPlacement,
    });
  } catch (error) {
    console.error("Mark Job Placement fulfilled error:", error);

    return res.status(500).json({
      success: false,
      message: "Failed to update Job Placement status",
      error: error.message,
    });
  }
};

// ===============================
// SET Live Project Applied Status
// ===============================

 const liveProjectApplication = async (req, res) => {
  try {
    const {  applied } = req.body;

    // Validation
    if ( typeof applied !== "boolean") {
      return res.status(400).json({
        success: false,
        message: "applied(boolean) are required",
      });
    }

    // Find user
    const user = await User.findById(req.user._id);

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }
    if(user.liveProject.applied === true){
      return res.status(400).json({
        success: false,
        message: "Already Applied"
      })
    }

    // Update job placement status
    user.liveProject.applied = applied;
    user.liveProject.status = "Applied"

    // Optional: update appliedAt only when applying
    if (applied) {
      user.liveProject.appliedAt = new Date();
    }

    await user.save();

    return res.status(200).json({
      success: true,
      message: "Applied for live project",
      liveProject: user.liveProject,
    });
  } catch (error) {
    console.error("Update live project error:", error);

    return res.status(500).json({
      success: false,
      message: "Failed to create live project status",
      error: error.message,
    });
  }
};

// ===============================
// GET Live project Status
// ===============================

  const getLiveProjectStatus = async (req, res) => {
  try {
    // Find users where liveproject.applied = true
    const users = await User.find(
      {
        "liveProject.applied": true
      },
      "fullName email phoneNo  liveProject"
    );

    return res.status(200).json({
      success: true,
      count: users.length,
      users
    });
  } catch (error) {
    console.error("Get applied live project users error:", error);

    return res.status(500).json({
      success: false,
      message: "Failed to fetch applied live project users",
      error: error.message
    });
  }
};


// ======================================
// MARK Live Project as Fulfilled
// ======================================

 const markLiveProjectAsFulfilled = async (req, res) => {
  try {
    const { userId } = req.body;

    if (!userId) {
      return res.status(400).json({
        success: false,
        message: "userId is required",
      });
    }

    const user = await User.findById(userId);

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    if (!user.liveProject.applied) {
      return res.status(400).json({
        success: false,
        message: "User has not applied for Live Project",
      });
    }

    if (user.liveProject.status === "Fulfilled") {
      return res.status(400).json({
        success: false,
        message: "Live Project is already marked as Fulfilled",
      });
    }

    user.liveProject.status = "Fulfilled";

    await user.save();

    return res.status(200).json({
      success: true,
      message: "Live Project status updated to Fulfilled",
      liveProject: user.liveProject,
    });
  } catch (error) {
    console.error("Mark live project fulfilled error:", error);

    return res.status(500).json({
      success: false,
      message: "Failed to update Live Project status",
      error: error.message,
    });
  }
};

// ===============================
// SET SoftSkill Applied Status
// ===============================

 const softSkillApplication = async (req, res) => {
  try {
    const {  applied } = req.body;

    // Validation
    if ( typeof applied !== "boolean") {
      return res.status(400).json({
        success: false,
        message: "applied(boolean) are required",
      });
    }

    // Find user
    const user = await User.findById(req.user._id);

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }
    if(user.softSkill.applied === true){
      return res.status(400).json({
        success: false,
        message: "Already Applied"
      })
    }

    // Update softSkillt status
    user.softSkill.applied = applied;
    user.softSkill.status = "Applied"

    // Optional: update appliedAt only when applying
    if (applied) {
      user.softSkill.appliedAt = new Date();
    }

    await user.save();

    return res.status(200).json({
      success: true,
      message: "Applied for softSkill",
      softSkill: user.softSkill,
    });
  } catch (error) {
    console.error("Update softSkill error:", error);

    return res.status(500).json({
      success: false,
      message: "Failed to create softSkill ",
      error: error.message,
    });
  }
};

// ===============================
// GET Live project Status
// ===============================

  const getSoftSkillStatus = async (req, res) => {
  try {
    // Find users where softSkill.applied = true
    const users = await User.find(
      {
        "softSkill.applied": true
      },
      "fullName email phoneNo  softSkill"
    );

    return res.status(200).json({
      success: true,
      count: users.length,
      users
    });
  } catch (error) {
    console.error("Get applied softSkill users error:", error);

    return res.status(500).json({
      success: false,
      message: "Failed to fetch applied softSkill users",
      error: error.message
    });
  }
};


// ======================================
// MARK Live Project as Fulfilled
// ======================================

 const markSoftSkillAsFulfilled = async (req, res) => {
  try {
    const { userId } = req.body;

    if (!userId) {
      return res.status(400).json({
        success: false,
        message: "userId is required",
      });
    }

    const user = await User.findById(userId);

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    if (!user.softSkill.applied) {
      return res.status(400).json({
        success: false,
        message: "User has not applied for softSkill",
      });
    }

    if (user.softSkill.status === "Fulfilled") {
      return res.status(400).json({
        success: false,
        message: "Soft Skill is already marked as Fulfilled",
      });
    }

    user.softSkill.status = "Fulfilled";

    await user.save();

    return res.status(200).json({
      success: true,
      message: "Soft Skill status updated to Fulfilled",
      softSkill: user.softSkill,
    });
  } catch (error) {
    console.error("Mark Soft Skill fulfilled error:", error);

    return res.status(500).json({
      success: false,
      message: "Failed to update Soft Skill status",
      error: error.message,
    });
  }
};



module.exports = {
  loginAdmin,
  logoutAdmin,
  getAllUsers,
  downloadUserResume,
  exportUsersCSV,
  exportNewUsersCSV,
  getUserStats,
  getInternshipApplicants,
  markInternshipAsFulfilled,
  getInternshipFulFilled,
  updateJobPlacementStatus,
  getJobPlacementStatus,
  markJobPlacementAsFulfilled,
  liveProjectApplication,
  getLiveProjectStatus,
  markLiveProjectAsFulfilled,
  softSkillApplication,
  getSoftSkillStatus,
  markSoftSkillAsFulfilled
};

