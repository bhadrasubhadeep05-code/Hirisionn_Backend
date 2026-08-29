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

const {otpGenrator, verifyOtp, ResetPassword} = require("../controllers/otp.controller.js")
const rateLimit = require("express-rate-limit");


const loginLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 10,
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    success: false,
    message: "Too many login attempts. Please try again later.",
  },
});

const registerLimiter = rateLimit({
  windowMs: 30 * 60 * 1000,
  max: 5,
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    success: false,
    message: "Too many registration attempts. Please try again later.",
  },
});

const passwordResetLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 5,
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    success: false,
    message: "Too many password reset attempts. Please try again later.",
  },
});

router.post('/register', registerLimiter, validateRegister, registerUser);
router.post('/login', loginLimiter, validateLogin, loginUser);
router.post('/logout', logoutUser);
router.put('/profile', verifyJWT, completeProfile);

// Forgot Password Routes
// router.post('/forgot-password/verify-user', passwordResetLimiter, validateVerifyUser, verifyUserForReset);
// router.post('/forgot-password/verify-answers', passwordResetLimiter, validateSecurityAnswers, verifySecurityAnswers);
// router.post('/forgot-password/reset', passwordResetLimiter, validateResetPassword, resetPassword);

//otp password recovery
router.post('/forgot-password', passwordResetLimiter, otpGenrator)
router.post('/verify-otp', passwordResetLimiter, verifyOtp)
router.post('/reset-password', passwordResetLimiter, ResetPassword)

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
