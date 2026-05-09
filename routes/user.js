const express = require("express");
const router = express.Router();
const User = require("../models/User.model.js");
const {
  registerUser,
  loginUser,
  completeProfile,
  verifyUserForReset,
  verifySecurityAnswers,
  resetPassword,
  logoutUser,
  getUser,
  updateProfile
} = require("../controllers/user.controller");
const verifyJWT = require("../middlewares/auth.middelware");
const {
  validateRegister,
  validateLogin,
  validateCompleteProfile,
  validateUpdateProfile,
  validateVerifyUser,
  validateSecurityAnswers,
  validateResetPassword
} = require("../middlewares/validateUser");

router.post('/register', validateRegister, registerUser);
router.post('/login', validateLogin, loginUser);
router.post('/logout', logoutUser);
router.put('/profile', verifyJWT, completeProfile);

// Forgot Password Routes
router.post('/forgot-password/verify-user', validateVerifyUser, verifyUserForReset);
router.post('/forgot-password/verify-answers', validateSecurityAnswers, verifySecurityAnswers);
router.post('/forgot-password/reset', validateResetPassword, resetPassword);

//get User Route
router.get('/getUser', verifyJWT, getUser);
//update User
router.put('/update', verifyJWT, validateUpdateProfile, updateProfile);

// Record internship application interest
router.post("/apply-internship", verifyJWT, async (req, res) => {
  try {
    const { category, subCategory } = req.body;

    // Validate required field
    if (!category) {
      return res.status(400).json({
        success: false,
        message: "Category is required",
      });
    }

    // Get current user
    const user = await User.findById(req.user._id);

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    // Ensure internshipInterests exists
    const internshipInterests = user.internshipInterests || [];

 

    // Prevent duplicate application for same category + subCategory
    const alreadyApplied = internshipInterests.some(
      (item) =>
        item.category === category &&
        item.subCategory === subCategory
    );

    if (alreadyApplied) {
      return res.status(400).json({
        success: false,
        message: "You have already applied for this internship",
      });
    }

    // Save new internship interest
    user.internshipInterests.push({
      category,
      subCategory,
      status: "Applied",
    });

    await user.save();

    return res.status(200).json({
      success: true,
      message: "Internship interest recorded successfully",
    });
  } catch (error) {
    console.error("Apply internship error:", error);

    return res.status(500).json({
      success: false,
      message: "Failed to record interest",
      error: error.message,
    });
  }
});



module.exports = router;
