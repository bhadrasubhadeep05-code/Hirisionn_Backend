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
router.post('/apply-internship', verifyJWT, async (req, res) => {
  try {
    const { category, subCategory } = req.body;
    
    if (!category || !subCategory) {
      return res.status(400).json({ 
        success: false, 
        message: "Category and subCategory are required" 
      });
    }

    await User.findByIdAndUpdate(req.user._id, {
      $push: {
        internshipInterests: { category, subCategory }
      }
    });

    res.status(200).json({ 
      success: true, 
      message: "Internship interest recorded successfully" 
    });
  } catch (error) {
    console.error("Apply internship error:", error);
    res.status(500).json({ 
      success: false, 
      message: "Failed to record interest",
      error: error.message 
    });
  }
});

// Admin route to get all internship applicants
router.get('/admin/internship-applicants', verifyJWT, async (req, res) => {
  try {
    // Get all users that have internship interests
    const users = await User.find({ 
      internshipInterests: { $exists: true, $not: { $size: 0 } } 
    }, 'fullName email internshipInterests');

    res.status(200).json({ success: true, users });
  } catch (error) {
    console.error("Fetch applicants error:", error);
    res.status(500).json({ success: false, message: "Failed to fetch applicants" });
  }
});

module.exports = router;
