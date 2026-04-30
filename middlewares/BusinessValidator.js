const validateBusiness = (req, res, next) => {
  const {
    fullname,
    email,
    organizationName,
    designation,
    phoneNumber,
    location,
    enquiryFor,
    message,
  } = req.body;

  const errors = [];

  // Full Name
  if (!fullname || fullname.trim().length < 3) {
    errors.push("Full name must be at least 3 characters");
  } else if (!/^[a-zA-Z\s]+$/.test(fullname.trim())) {
    errors.push("Full name can only contain letters and spaces");
  }

  // Email
  if (!email) {
    errors.push("Email is required");
  } else if (!/^\S+@\S+\.\S+$/.test(email.trim())) {
    errors.push("Invalid email format");
  }

  // Organization Name
  if (!organizationName || organizationName.trim().length < 2) {
    errors.push("Organization name is required");
  }

  // Designation
  if (!designation || designation.trim() === "") {
    errors.push("Please provide designation");
  }

  // Phone Number
  if (!phoneNumber) {
    errors.push("Phone number is required");
  } else if (!/^[6-9]\d{9}$/.test(phoneNumber.trim())) {
    errors.push("Invalid Indian phone number");
  }

  // Location
  if (!location || location.trim() === "") {
    errors.push("Location is required");
  }

  // Enquiry Type
  const allowedEnquiries = [
    "Human Resources (HR)",
    "Information Technology (IT)",
    "Marketing",
    "Sales",
    "Finance",
    "Retail",
    "General Staffing",
    "Business Process Outsourcing (BPO)",
    "Knowledge Process Outsourcing (KPO)",
    "Bachelor of Technology (B.Tech) Recruitment",
    "Bachelor of Engineering (B.E.) Recruitment",
    "Diploma (DIP) Talent Sourcing",
  ];

  if (!enquiryFor || !allowedEnquiries.includes(enquiryFor)) {
    errors.push("Invalid enquiry type");
  }

  // Message
  if (!message || message.trim().length < 10) {
    errors.push("Message must be at least 10 characters");
  } else if (message.trim().length > 500) {
    errors.push("Message cannot exceed 500 characters");
  }

  // Return only ONE response
  if (errors.length > 0) {
    return res.status(400).json({
      success: false,
      errors,
      message: errors[0], // first error for frontend alert
    });
  }

  // Sanitize data
  req.body.fullname = fullname.trim();
  req.body.email = email.trim().toLowerCase();
  req.body.organizationName = organizationName.trim();
  req.body.designation = designation.trim();
  req.body.phoneNumber = phoneNumber.trim();
  req.body.location = location.trim();
  req.body.message = message.trim();

  next();
};

module.exports = validateBusiness;