const ApiError = require("../utils/ApiError.js");

// ============================================================
// Shared validation helpers
// ============================================================
const EMAIL_REGEX = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
const PHONE_REGEX = /^\d{10}$/;
const MOBILE_REGEX = /^[6-9]\d{9}$/;
const NAME_REGEX = /^[A-Za-z\u00C0-\u017F' .-]+$/;
const PASSWORD_REGEX = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]).+$/;
const LINKEDIN_REGEX = /^https?:\/\/(www\.)?linkedin\.com\/(in|company|pub)\/.*$/i;

const MIN_PASSWORD_LENGTH = 8;
const MAX_PASSWORD_LENGTH = 128;

// Validate a strong password (length + complexity).
const assertStrongPassword = (password, fieldLabel = "Password") => {
  if (!password || typeof password !== "string") {
    throw new ApiError(`${fieldLabel} is required`, 400);
  }
  if (password.length < MIN_PASSWORD_LENGTH) {
    throw new ApiError(`${fieldLabel} must be at least ${MIN_PASSWORD_LENGTH} characters`, 400);
  }
  if (password.length > MAX_PASSWORD_LENGTH) {
    throw new ApiError(`${fieldLabel} must not exceed ${MAX_PASSWORD_LENGTH} characters`, 400);
  }
  if (!PASSWORD_REGEX.test(password)) {
    throw new ApiError(
      `${fieldLabel} must contain at least one uppercase letter, one lowercase letter, one number, and one special character`,
      400
    );
  }
};

// Generic check that a field exists, is a non-empty trimmed string, within bounds.
const assertText = (value, label, { min = 1, max = 500 } = {}) => {
  if (value === undefined || value === null || typeof value !== "string") {
    throw new ApiError(`${label} is required`, 400);
  }
  const trimmed = value.trim();
  if (!trimmed) {
    throw new ApiError(`${label} is required`, 400);
  }
  if (trimmed.length < min) {
    throw new ApiError(`${label} must be at least ${min} characters`, 400);
  }
  if (trimmed.length > max) {
    throw new ApiError(`${label} must not exceed ${max} characters`, 400);
  }
  return trimmed;
};

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

  // Full name
  assertText(fullName, "Full name", { min: 3, max: 100 });
  if (!NAME_REGEX.test(fullName.trim())) {
    throw new ApiError("Full name can only contain letters, spaces, hyphens and apostrophes", 400);
  }

  // Email
  assertText(email, "Email", { max: 254 });
  const normalizedEmail = email.trim().toLowerCase();
  if (!EMAIL_REGEX.test(normalizedEmail)) {
    throw new ApiError("Please enter a valid email address", 400);
  }

  // Phone number (Indian mobile: 10 digits starting with 6-9)
  assertText(phoneNo, "Phone number", { max: 10 });
  if (!MOBILE_REGEX.test(phoneNo.trim())) {
    throw new ApiError("Phone number must be a valid 10-digit mobile number", 400);
  }

  // Password + confirmation
  assertStrongPassword(password);
  if (!confirmPassword || typeof confirmPassword !== "string") {
    throw new ApiError("Confirm password is required", 400);
  }
  if (password !== confirmPassword) {
    throw new ApiError("Passwords do not match", 400);
  }

  // Security questions & answers
  assertText(securityQuestion1, "Security question 1", { min: 3, max: 200 });
  assertText(securityAnswer1, "Security answer 1", { min: 2, max: 200 });
  assertText(securityQuestion2, "Security question 2", { min: 3, max: 200 });
  assertText(securityAnswer2, "Security answer 2", { min: 2, max: 200 });

  if (securityQuestion1.trim() === securityQuestion2.trim()) {
    throw new ApiError("Security questions must be different", 400);
  }

  next();
};

// ===================== LOGIN USER VALIDATION =====================
exports.validateLogin = (req, res, next) => {
  const { phoneNo, password } = req.body;

  assertText(phoneNo, "Phone number", { max: 10 });
  if (!PHONE_REGEX.test(phoneNo.trim())) {
    throw new ApiError("Phone number must be 10 digits", 400);
  }

  if (!password || typeof password !== "string" || !password.trim()) {
    throw new ApiError("Password is required", 400);
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
    education,
    linkedin
  } = req.body;

  assertText(experienceLevel, "Experience level", { min: 2, max: 100 });
  assertText(job, "Job title", { min: 2, max: 100 });
  assertText(employer, "Employer name", { min: 2, max: 150 });
  assertText(currentCTC, "Current CTC", { min: 1, max: 50 });
  assertText(course, "Course details", { min: 2, max: 200 });
  assertText(domain, "Domain", { min: 2, max: 100 });
  assertText(education, "Education details", { min: 2, max: 200 });

  // LinkedIn is optional, but must be valid when provided
  if (linkedin !== undefined && linkedin !== null && linkedin.trim()) {
    if (!LINKEDIN_REGEX.test(linkedin.trim())) {
      throw new ApiError("Please enter a valid LinkedIn URL", 400);
    }
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
  const updateFields = {
    experienceLevel,
    job,
    employer,
    currentCTC,
    course,
    domain,
    education,
    linkedin
  };

  const hasAtLeastOneField = Object.values(updateFields).some(
    (field) => field !== undefined && field !== null && field !== ""
  );

  if (!hasAtLeastOneField && !req.body.resume) {
    throw new ApiError("At least one field is required to update profile", 400);
  }

  // Validate only the fields that were actually provided
  if (job !== undefined && job !== null && job !== "") {
    assertText(job, "Job title", { min: 2, max: 100 });
  }
  if (employer !== undefined && employer !== null && employer !== "") {
    assertText(employer, "Employer name", { min: 2, max: 150 });
  }
  if (experienceLevel !== undefined && experienceLevel !== null && experienceLevel !== "") {
    assertText(experienceLevel, "Experience level", { min: 2, max: 100 });
  }
  if (currentCTC !== undefined && currentCTC !== null && currentCTC !== "") {
    assertText(currentCTC, "Current CTC", { min: 1, max: 50 });
  }
  if (course !== undefined && course !== null && course !== "") {
    assertText(course, "Course details", { min: 2, max: 200 });
  }
  if (domain !== undefined && domain !== null && domain !== "") {
    assertText(domain, "Domain", { min: 2, max: 100 });
  }
  if (education !== undefined && education !== null && education !== "") {
    assertText(education, "Education details", { min: 2, max: 200 });
  }
  if (linkedin !== undefined && linkedin !== null && linkedin.trim()) {
    if (!LINKEDIN_REGEX.test(linkedin.trim())) {
      throw new ApiError("Please enter a valid LinkedIn URL", 400);
    }
  }

  next();
};

// ===================== FORGOT PASSWORD VALIDATIONS =====================
exports.validateVerifyUser = (req, res, next) => {
  const { phoneNo } = req.body;

  assertText(phoneNo, "Phone number", { max: 10 });
  if (!PHONE_REGEX.test(phoneNo.trim())) {
    throw new ApiError("Phone number must be 10 digits", 400);
  }

  next();
};

exports.validateSecurityAnswers = (req, res, next) => {
  const { userId, answer1, answer2 } = req.body;

  assertText(userId, "User ID", { min: 1, max: 100 });
  assertText(answer1, "Answer 1", { min: 2, max: 200 });
  assertText(answer2, "Answer 2", { min: 2, max: 200 });

  next();
};

exports.validateResetPassword = (req, res, next) => {
  const { resetToken, newPassword, confirmPassword } = req.body;

  assertText(resetToken, "Reset token", { min: 1, max: 500 });
  assertStrongPassword(newPassword, "New password");

  if (!confirmPassword || typeof confirmPassword !== "string") {
    throw new ApiError("Confirm password is required", 400);
  }
  if (newPassword !== confirmPassword) {
    throw new ApiError("Passwords do not match", 400);
  }

  next();
};