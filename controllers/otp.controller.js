
const crypto = require('crypto');
const { sendEmail } = require('../utils/mailer');
const User = require('../models/User.model.js');
const Otp = require('../models/Otp.model.js');
const asyncHandler = require('../utils/asyncHandler');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');

// Email format regex (mirrors the pattern used in middlewares/validateUser.js)
const EMAIL_REGEX = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;

// Validates the email from req.body and returns it normalized (trimmed + lowercased).
// Sends a 400 response and returns null when the email is missing/invalid.
const validateEmail = (req, res) => {
  const { email } = req.body;

  if (email === undefined || email === null || typeof email !== 'string' || !email.trim()) {
    res.status(400).json({ error: 'Email is required.' });
    return null;
  }

  const normalizedEmail = email.trim().toLowerCase();
  if (!EMAIL_REGEX.test(normalizedEmail)) {
    res.status(400).json({ error: 'Please enter a valid email address.' });
    return null;
  }

  return normalizedEmail;
};

exports.otpGenrator = asyncHandler(async(req, res)=>{
    // 1. Request Password Reset OTP
  const email = validateEmail(req, res);
  if (!email) return;

  try {
    const user = await User.findOne({ email });
    if (!user) {
      // Return 200/generic message to prevent user enumeration attacks
      return res.status(200).json({ message: 'If the email exists, an OTP has been sent.' });
    }

    // Generate a random 6-digit numeric OTP
    const otp = crypto.randomInt(100000, 999999).toString();

    // Hash the OTP before storing
    const otpHash = crypto.createHash('sha256').update(otp).digest('hex');

    // Remove any previous OTPs for this email and save the new one
    await Otp.deleteMany({ email });
    await Otp.create({ email, otpHash });

    // Send the email
    await sendEmail({
      to: email,
      subject: 'Your Password Reset OTP',
      text: `Your password recovery code is ${otp}. It expires in 10 minutes.`,
      html: `
        <div style="font-family: Arial, sans-serif; padding: 20px;">
          <h2>Password Recovery</h2>
          <p>Use the following 6-digit verification code to reset your password:</p>
          <h1 style="letter-spacing: 5px; color: #2563eb;">${otp}</h1>
          <p>This code will expire in <strong>10 minutes</strong>. If you did not request this, ignore this email.</p>
        </div>
      `,
    });

    res.status(200).json({ message: 'If the email exists, an OTP has been sent.' });
  } catch (error) {
    console.error('Forgot Password Error:', error);
    res.status(500).json({ error: 'Failed to process request.' });
  }

})

exports.verifyOtp = asyncHandler(async(req, res)=>{
  const email = validateEmail(req, res);
  if (!email) return;

  const { otp } = req.body;
  if (!otp) {
    return res.status(400).json({ error: 'OTP is required.' });
  }

  try{
    const incomingOtpHash = crypto.createHash('sha256').update(otp).digest('hex');
    const otpRecord = await Otp.findOne({ email, otpHash: incomingOtpHash });
  if (!otpRecord) {
      return res.status(400).json({ error: 'Invalid or expired OTP.' });
    }

    // OTP is valid - delete it immediately so it can never be reused
    await Otp.deleteOne({ _id: otpRecord._id });

    // Issue a short-lived Reset JWT (10 minutes)
    const resetToken = jwt.sign(
      { email, purpose: 'password_reset' },
      process.env.JWT_RESET_SECRET,
      { expiresIn: '10m' }
    );

    res.status(200).json({
      success: true,
      message: 'OTP verified successfully.',
      resetToken, // Send token to frontend
    });
  } catch (error) {
    console.error('Verify OTP Error:', error);
    res.status(500).json({ error: 'Failed to verify OTP.' });
  }
})

exports.ResetPassword = asyncHandler(async(req, res)=>{
    const { resetToken, newPassword } = req.body;

  if (!resetToken || !newPassword) {
    return res.status(400).json({ error: 'Reset token and new password are required.' });
  }

  try {
    // 1. Verify and decode JWT
    const decoded = jwt.verify(resetToken, process.env.JWT_RESET_SECRET);

    // 2. Ensure purpose matches
    if (decoded.purpose !== 'password_reset') {
      return res.status(403).json({ error: 'Invalid token purpose.' });
    }

    const email = decoded.email;

    // 3. Hash new password
    const hashedPassword = await bcrypt.hash(newPassword, 10);

    // 4. Update user in DB
    const user = await User.findOneAndUpdate(
      { email },
      { $set: { password: hashedPassword } }
    );

    if (!user) {
      return res.status(404).json({ error: 'User not found.' });
    }

    res.status(200).json({
      success: true,
      message: 'Password updated successfully. You can now log in with your new password.',
    });
  } catch (error) {
    if (error.name === 'TokenExpiredError') {
      return res.status(401).json({ error: 'Reset token has expired. Please request a new OTP.' });
    }
    if (error.name === 'JsonWebTokenError') {
      return res.status(401).json({ error: 'Invalid reset token.' });
    }

    console.error('Reset Password Error:', error);
    res.status(500).json({ error: 'Failed to reset password.' });
  }
})