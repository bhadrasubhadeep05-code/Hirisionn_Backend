const ApiError = require("../utils/ApiError.js");

// ===================== REGISTER USER VALIDATION =====================
exports.validateRegister = (req, res, next) => {
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

  // Required fields check
  if (!fullName || typeof fullName !== "string") {
    throw new ApiError("Full name is required", 400);
  }
  if (!email || typeof email !== "string") {
    throw new ApiError("Email is required", 400);
  }
  if (!phoneNo || typeof phoneNo !== "string") {
    throw new ApiError("Phone number is required", 400);
  }
  if (!password || typeof password !== "string") {
    throw new ApiError("Password is required", 400);
  }
  if (!confirmPassword || typeof confirmPassword !== "string") {
    throw new ApiError("Confirm password is required", 400);
  }
  if (!securityQuestion1 || typeof securityQuestion1 !== "string") {
    throw new ApiError("Security question 1 is required", 400);
  }
  if (!securityAnswer1 || typeof securityAnswer1 !== "string") {
    throw new ApiError("Security answer 1 is required", 400);
  }
  if (!securityQuestion2 || typeof securityQuestion2 !== "string") {
    throw new ApiError("Security question 2 is required", 400);
  }
  if (!securityAnswer2 || typeof securityAnswer2 !== "string") {
    throw new ApiError("Security answer 2 is required", 400);
  }

  // Format validation
  if (fullName.trim().length < 3) {
    throw new ApiError("Full name must be at least 3 characters", 400);
  }
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    throw new ApiError("Please enter a valid email address", 400);
  }
  if (!/^[0-9]{10}$/.test(phoneNo.trim())) {
    throw new ApiError("Phone number must be 10 digits", 400);
  }
  if (password.length < 6) {
    throw new ApiError("Password must be at least 6 characters", 400);
  }
  if (securityAnswer1.trim().length < 2) {
    throw new ApiError("Security answer 1 is required", 400);
  }
  if (securityAnswer2.trim().length < 2) {
    throw new ApiError("Security answer 2 is required", 400);
  }

  next();
};

// ===================== LOGIN USER VALIDATION =====================
exports.validateLogin = (req, res, next) => {
  const { phoneNo, password } = req.body;

  if (!phoneNo || typeof phoneNo !== "string") {
    throw new ApiError("Phone number is required", 400);
  }
  if (!password || typeof password !== "string") {
    throw new ApiError("Password is required", 400);
  }
  if (!/^[0-9]{10}$/.test(phoneNo.trim())) {
    throw new ApiError("Phone number must be 10 digits", 400);
  }

  next();
};

// ===================== COMPLETE PROFILE VALIDATION =====================
exports.validateCompleteProfile = (req, res, next) => {
  const {
    experienceLevel,
    job,
    employer,
    currentCTC,
    course,
    domain,
    education
  } = req.body;
  if (!experienceLevel || typeof experienceLevel !== "string") {
    throw new ApiError("Experience level is required", 400);
  }
  if (!job || typeof job !== "string") {
    throw new ApiError("Job title is required", 400);
  }
  if (!employer || typeof employer !== "string") {
    throw new ApiError("Employer name is required", 400);
  }
  if (!currentCTC || typeof currentCTC !== "string") {
    throw new ApiError("Current CTC is required", 400);
  }
  if (!course || typeof course !== "string") {
    throw new ApiError("Course details are required", 400);
  }
  if (!domain || typeof domain !== "string") {
    throw new ApiError("Domain is required", 400);
  }
  if (!education || typeof education !== "string") {
    throw new ApiError("Education details are required", 400);
  }

  if (job.trim().length < 2) {
    throw new ApiError("Job title must be at least 2 characters", 400);
  }
  if (employer.trim().length < 2) {
    throw new ApiError("Employer name must be at least 2 characters", 400);
  }

  next();
};

// ===================== UPDATE PROFILE VALIDATION =====================
exports.validateUpdateProfile = (req, res, next) => {
  const {
    experienceLevel,
    job,
    employer,
    currentCTC,
    course,
    domain,
    education,
    linkedin
  } = req.body;

  // At least one field should be present for update
  const updateFields = { experienceLevel, job, employer, currentCTC, course, domain, education, linkedin };
  const hasAtLeastOneField = Object.values(updateFields).some(field => field !== undefined && field !== null && field !== "");
  
  if (!hasAtLeastOneField && !req.body.resume) {
    throw new ApiError("At least one field is required to update profile", 400);
  }

  // Validate fields if they are provided
  if (job && job.trim().length < 2) {
    throw new ApiError("Job title must be at least 2 characters", 400);
  }
  if (employer && employer.trim().length < 2) {
    throw new ApiError("Employer name must be at least 2 characters", 400);
  }
  if (linkedin && linkedin.trim().length > 0 && !/^https?:\/\/(www\.)?linkedin\.com\/.*$/.test(linkedin)) {
    throw new ApiError("Please enter a valid LinkedIn URL", 400);
  }

  next();
};

// ===================== FORGOT PASSWORD VALIDATIONS =====================
exports.validateVerifyUser = (req, res, next) => {
  const { phoneNo } = req.body;
  
  if (!phoneNo || typeof phoneNo !== "string") {
    throw new ApiError("Phone number is required", 400);
  }
  if (!/^[0-9]{10}$/.test(phoneNo.trim())) {
    throw new ApiError("Phone number must be 10 digits", 400);
  }

  next();
};

exports.validateSecurityAnswers = (req, res, next) => {
  const { userId, answer1, answer2 } = req.body;
  
  if (!userId || typeof userId !== "string") {
    throw new ApiError("User ID is required", 400);
  }
  if (!answer1 || typeof answer1 !== "string") {
    throw new ApiError("Answer 1 is required", 400);
  }
  if (!answer2 || typeof answer2 !== "string") {
    throw new ApiError("Answer 2 is required", 400);
  }

  next();
};

exports.validateResetPassword = (req, res, next) => {
  const { resetToken, newPassword, confirmPassword } = req.body;
  
  if (!resetToken || typeof resetToken !== "string") {
    throw new ApiError("Reset token is required", 400);
  }
  if (!newPassword || typeof newPassword !== "string") {
    throw new ApiError("New password is required", 400);
  }
  if (!confirmPassword || typeof confirmPassword !== "string") {
    throw new ApiError("Confirm password is required", 400);
  }
  if (newPassword.length < 6) {
    throw new ApiError("New password must be at least 6 characters", 400);
  }

  next();
};