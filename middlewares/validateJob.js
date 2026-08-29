const ApiResponse = require("../utils/ApiResponse.js");

const validateJob = (req, res, next) => {
  try {
    const {
      jobTitle,
      jobDescription,
      CTC,
      deadLine,
      industries,
      location,
      domain,
      jobType,
      eligibility,
      experience,
      active,
      formLink
    } = req.body;

    // jobTitle validation
    if (!jobTitle || typeof jobTitle !== "string" || !jobTitle.trim()) {
      return res.status(400).json(new ApiResponse(400, null, "Job title is required and must be a non-empty string"));
    }
    if (jobTitle.trim().length < 5) {
      return res.status(400).json(new ApiResponse(400, null, "Job title must be at least 5 characters long"));
    }
    if (jobTitle.trim().length > 150) {
      return res.status(400).json(new ApiResponse(400, null, "Job title must not exceed 150 characters"));
    }

   // Job Description
if (jobDescription !== undefined) {
  if (typeof jobDescription !== "string") {
    errors.jobDescription = "Job description must be a string";
  } else {
    const plainText = jobDescription
      .replace(/<[^>]*>/g, " ")
      .replace(/&nbsp;/g, " ")
      .replace(/&amp;/g, "&")
      .replace(/&lt;/g, "<")
      .replace(/&gt;/g, ">")
      .replace(/\s+/g, " ")
      .trim();

    if (plainText.length < 10) {
      errors.jobDescription =
        "Job description must be at least 10 characters";
    }
  }
}

    // CTC validation
    if (CTC === undefined || CTC === null || (typeof CTC !== "string" && typeof CTC !== "number")) {
      return res.status(400).json(new ApiResponse(400, null, "CTC is required"));
    }

    const normalizedCtc = typeof CTC === "string" ? CTC.trim() : String(CTC).trim();
    if (!normalizedCtc) {
      return res.status(400).json(new ApiResponse(400, null, "CTC is required"));
    }

    // deadLine validation
    if (!deadLine) {
      return res.status(400).json(new ApiResponse(400, null, "Deadline is required"));
    }
    const deadlineDate = new Date(deadLine);
    if (isNaN(deadlineDate.getTime())) {
      return res.status(400).json(new ApiResponse(400, null, "Deadline must be a valid date"));
    }
    if (deadlineDate <= new Date()) {
      return res.status(400).json(new ApiResponse(400, null, "Deadline must be a future date"));
    }

    // industries validation
    if (!industries || typeof industries !== "string" || !industries.trim()) {
      return res.status(400).json(new ApiResponse(400, null, "Industries is required and must be a non-empty string"));
    }

    // location validation
    if (!location || typeof location !== "string" || !location.trim()) {
      return res.status(400).json(new ApiResponse(400, null, "Location is required and must be a non-empty string"));
    }

    // domain validation
    if (!domain || typeof domain !== "string" || !domain.trim()) {
      return res.status(400).json(new ApiResponse(400, null, "Domain is required and must be a non-empty string"));
    }

    // jobType validation
    if (!jobType || typeof jobType !== "string" || !jobType.trim()) {
      return res.status(400).json(new ApiResponse(400, null, "Job type is required and must be a non-empty string"));
    }

    // eligibility validation
    if (!eligibility || typeof eligibility !== "string" || !eligibility.trim()) {
      return res.status(400).json(new ApiResponse(400, null, "Eligibility is required and must be a non-empty string"));
    }

    // experience validation
    if (!experience || typeof experience !== "string" || !experience.trim()) {
      return res.status(400).json(new ApiResponse(400, null, "Experience is required and must be a non-empty string"));
    }

    if (active !== undefined && active !== null && typeof active !== "boolean") {
      return res.status(400).json(new ApiResponse(400, null, "Active must be a Boolean"));
    }
    
    // Sanitize and attach validated data to request
    req.validatedJobData = {
      jobTitle: jobTitle.trim(),
      jobDescription: jobDescription.trim(),
      CTC: normalizedCtc,
      deadLine: new Date(deadLine),
      industries: industries.trim(),
      location: location.trim(),
      domain: domain.trim(),
      jobType: jobType.trim(),
      eligibility: eligibility.trim(),
      experience: experience.trim(),
      active: typeof active === "boolean" ? active : true,
      formLink,
    };

    next();
  } catch (error) {
    return res.status(500).json(new ApiResponse(500, null, "Validation error: " + error.message));
  }
};

module.exports = validateJob;