const express = require("express");
const router = express.Router();
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

module.exports = router;
