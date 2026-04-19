const asyncHandler = require("../utils/asyncHandler");
const ApiError = require("../utils/ApiError");
const { uploadOnCloudinary, deleteFromCloudinary } = require("../utils/resumeUploader");
const User = require("../models/User.model");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");

const generateToken = (userId) => {
  return jwt.sign(
    { _id: userId },
    process.env.JWT_SECRET,
    { expiresIn: "7d" }
  );
};
exports.registerUser = asyncHandler(async(req, res)=>{ 
     const {
    fullName,
    email,
    phoneNo,
    password,
    confirmPassword,
    securityQuestion1,
    securityAnswer1,
    securityQuestion2,
    securityAnswer2
  } = req.body;

  if(password !== confirmPassword){
    throw new ApiError(400, "Passwords do not match");
  }

  const existingUser = await User.findOne({email});
  if(existingUser){
    throw new ApiError("User already exists", 409)
  }
  const hashPassword = await bcrypt.hash(password, 10);
  const user = await User.create({
    fullName,
    email,
    phoneNo,
    password: hashPassword,
    securityQuestions: [
      {
        question: securityQuestion1,
        answer: await bcrypt.hash(securityAnswer1, 10)
      },
      {
        question: securityQuestion2,
        answer: await bcrypt.hash(securityAnswer2, 10)
      }
    ],
    isProfileComplete: false
  });

  const token = generateToken(user._id); 

  res.json({
  token,
  isProfileComplete: false,
  succes:true,
});
});

exports.loginUser = asyncHandler(async (req, res) => {
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

  const token = generateToken(user._id);

  return res.json({
    token,
    isProfileComplete: user.isProfileComplete,
    succes: true,
  });
});

exports.completeProfile = asyncHandler(async (req, res) => {
  const user = await User.findById(req.user._id);
  let resumeData = user.profile?.resume || null;
if (req.body.resume) {
  resumeData = await uploadOnCloudinary(req.body.resume);
}
  user.profile = {
    experienceLevel: req.body.experienceLevel,
    job: req.body.job,
    employer: req.body.employer,
    currentCTC: req.body.currentCTC,
    course: req.body.course,
    domain: req.body.domain,
    education: req.body.education,
    linkedin: req.body.linkedin,
    resume: resumeData
  };

  user.isProfileComplete = true;

  await user.save();

  res.json({ message: "Profile completed" });
});

// ============= FORGOT PASSWORD CONTROLLERS =============

// Step 1: Verify user and return security questions
exports.verifyUserForReset = asyncHandler(async (req, res) => {
  const { phoneNo } = req.body;

  const user = await User.findOne({ phoneNo });
  if (!user) {
    throw new ApiError("User not found with this phone number", 404);
  }

  // Return only the security questions (not answers)
  res.json({
    success: true,
    userId: user._id,
    securityQuestions: user.securityQuestions.map(q => ({
      id: q._id,
      question: q.question
    }))
  });
});

// Step 2: Verify security answers and allow password reset
exports.verifySecurityAnswers = asyncHandler(async (req, res) => {
  const { userId, answer1, answer2 } = req.body;

  const user = await User.findById(userId);
  if (!user) {
    throw new ApiError("User not found", 404);
  }

  // Verify both security answers
  const isAnswer1Correct = await bcrypt.compare(answer1, user.securityQuestions[0].answer);
  const isAnswer2Correct = await bcrypt.compare(answer2, user.securityQuestions[1].answer);

  if (!isAnswer1Correct || !isAnswer2Correct) {
    throw new ApiError("Security answers are incorrect", 400);
  }

  // Generate short lived reset token (15 minutes)
  const resetToken = jwt.sign(
    { _id: userId, type: "reset" },
    process.env.JWT_SECRET,
    { expiresIn: "15m" }
  );

  res.json({
    success: true,
    resetToken,
    message: "Security answers verified"
  });
});

// Step 3: Reset password with valid reset token
exports.resetPassword = asyncHandler(async (req, res) => {
  const { resetToken, newPassword, confirmPassword } = req.body;

  if (newPassword !== confirmPassword) {
    throw new ApiError("Passwords do not match", 400);
  }

  // Verify reset token
  const decoded = jwt.verify(resetToken, process.env.JWT_SECRET);
  if (!decoded || decoded.type !== "reset") {
    throw new ApiError("Invalid or expired reset token", 401);
  }

  const user = await User.findById(decoded._id);
  if (!user) {
    throw new ApiError("User not found", 404);
  }

  // Hash and save new password
  user.password = await bcrypt.hash(newPassword, 10);
  await user.save();

  res.json({
    success: true,
    message: "Password has been reset successfully"
  });
});
exports.getUser = asyncHandler(async (req, res) => {
  const user = await User.findById(req.user._id).select("-password -securityQuestions");
  
  if (!user) {
    throw new ApiError("User not found", 404);
  }

  // ✅ Return flat user object directly (matches frontend expectations)
  res.json({
    _id: user._id,
    fullName: user.fullName,
    phoneNo: user.phoneNo,
    email: user.email,
    isProfileComplete: user.isProfileComplete,
    profileComplete: user.isProfileComplete,
    experienceLevel: user.profile?.experienceLevel || "",
    job: user.profile?.job || "",
    employer: user.profile?.employer || "",
    currentCTC: user.profile?.currentCTC || "",
    course: user.profile?.course || "",
    domain: user.profile?.domain || "",
    education: user.profile?.education || "",
    linkedin: user.profile?.linkedin || "",
    resume: user.profile?.resume || null,
  });
});

exports.updateProfile = asyncHandler(async (req, res) => {
  const user = await User.findById(req.user._id);
  
  if (!user) {
    throw new ApiError("User not found", 404);
  }

  let resumeData = user.profile?.resume || null;

  // ✅ Handle resume upload if provided
  if (req.body.resume) {
    // 🔥 Delete OLD resume first before uploading new one
    if (user.profile?.resume?.public_id) {
      await deleteFromCloudinary(user.profile.resume.public_id);
    }
    
    resumeData = await uploadOnCloudinary(req.body.resume);
  }

  // ✅ Merge existing profile with new updates
  user.profile = {
    ...user.profile,
    experienceLevel: req.body.experienceLevel,
    job: req.body.job,
    employer: req.body.employer,
    currentCTC: req.body.currentCTC,
    course: req.body.course,
    domain: req.body.domain,
    education: req.body.education,
    linkedin: req.body.linkedin,
    resume: resumeData,
  };
  user.downloaded = false;

  user.isProfileComplete = true;
  await user.save();

  // ✅ Return updated user object
  res.json({
    success: true,
    message: "Profile updated successfully",
    user: {
      fullName: user.fullName,
      phoneNo: user.phoneNo,
      email: user.email,
      isProfileComplete: user.isProfileComplete,
      ...user.profile
    }
  });
});
const createPass = async()=>{
   const hashedPassword = await bcrypt.hash("@khewat@1234#", 10);
   console.log(hashedPassword);
}
createPass();