const asyncHandler = require("../utils/asyncHandler");
const ApiError = require("../utils/ApiError");
const Business = require("../models/Business.model.js");

// @desc    Create new Business Enquiry
// @route   POST /api/business
// @access  Public
exports.createBusinessEnquiry = asyncHandler(async (req, res) => {
const {
  fullname,
  email,
  organizationName,
  designation,
  phoneNumber,
  location,
  enquiryFor,
  message
} = req.body;

  // Check for existing enquiry with same email + phone (optional - prevent duplicate submissions)
  const existingEnquiry = await Business.findOne({ email, phoneNumber });
  if (existingEnquiry) {
    return res.status(200).json({
      success: true,
      message: "We have already received your enquiry. Our team will contact you shortly.",
      alreadyExists: true
    });
  }

  // Create new business enquiry
  const businessEnquiry = await Business.create({
    fullname,
  email,
  organizationName,
  designation,
  phoneNumber,
  location,
  enquiryFor,
  message
  });

  res.status(201).json({
    success: true,
    message: "Business enquiry submitted successfully",
    data: businessEnquiry
  });
});

// @desc    Get all Business Enquiries (Admin only)
// @route   GET /api/business
// @access  Private/Admin
exports.getAllBusinessEnquiries = asyncHandler(async (req, res) => {
  const enquiries = await Business.find().sort({ createdAt: -1 });

  res.status(200).json({
    success: true,
    count: enquiries.length,
    data: enquiries
  });
});

// @desc    Get single Business Enquiry by ID (Admin only)
// @route   GET /api/business/:id
// @access  Private/Admin
exports.getBusinessEnquiryById = asyncHandler(async (req, res) => {
  const enquiry = await Business.findById(req.params.id);

  if (!enquiry) {
    throw new ApiError(404, "Business enquiry not found");
  }

  res.status(200).json({
    success: true,
    data: enquiry
  });
});

// @desc    Update Business Enquiry (Admin only - mark as read/processed)
// @route   PUT /api/business/:id
// @access  Private/Admin
exports.updateBusinessEnquiry = asyncHandler(async (req, res) => {
  let enquiry = await Business.findById(req.params.id);

  if (!enquiry) {
    throw new ApiError(404, "Business enquiry not found");
  }

  // Update fields - typically admin would mark status, add notes etc.
  enquiry = await Business.findByIdAndUpdate(
    req.params.id,
    req.body,
    { new: true, runValidators: true }
  );

  res.status(200).json({
    success: true,
    message: "Business enquiry updated successfully",
    data: enquiry
  });
});

// @desc    Delete Business Enquiry (Admin only)
// @route   DELETE /api/business/:id
// @access  Private/Admin
exports.deleteBusinessEnquiry = asyncHandler(async (req, res) => {
  const enquiry = await Business.findById(req.params.id);

  if (!enquiry) {
    throw new ApiError(404, "Business enquiry not found");
  }

  await Business.findByIdAndDelete(req.params.id);

  res.status(200).json({
    success: true,
    message: "Business enquiry deleted successfully"
  });
});