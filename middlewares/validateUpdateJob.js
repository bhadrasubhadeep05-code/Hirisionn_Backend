const validateUpdateJob = (req, res, next) => {
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
    formLink,
  } = req.body;

  const errors = {};

  // At least one field must be provided
  if (Object.keys(req.body).length === 0) {
    errors.general = "At least one field is required to update the job";
  }

  // Job Title
  if (jobTitle !== undefined) {
    if (
      typeof jobTitle !== "string" ||
      jobTitle.trim().length < 3
    ) {
      errors.jobTitle = "Job title must be at least 3 characters";
    }
  }

  // Job Description
  if (jobDescription !== undefined) {
    if (
      typeof jobDescription !== "string" ||
      jobDescription.trim().length < 10
    ) {
      errors.jobDescription =
        "Job description must be at least 10 characters";
    }
  }

  // CTC
  if (CTC !== undefined) {
    if (
      typeof CTC !== "string" &&
      typeof CTC !== "number"
    ) {
      errors.CTC = "CTC must be a string or number";
    }
  }

  // Deadline
  if (deadLine !== undefined) {
    const deadlineDate = new Date(deadLine);

    if (isNaN(deadlineDate.getTime())) {
      errors.deadLine = "Invalid deadline date";
    }
  }

  // Industries
  if (industries !== undefined) {
    if (
      typeof industries !== "string" ||
      industries.trim().length === 0
    ) {
      errors.industries = "Industries must be a non-empty string";
    }
  }

  // Location
  if (location !== undefined) {
    if (
      typeof location !== "string" ||
      location.trim().length < 2
    ) {
      errors.location = "Invalid location";
    }
  }

  // Domain
  if (domain !== undefined) {
    if (
      typeof domain !== "string" ||
      domain.trim().length < 2
    ) {
      errors.domain = "Invalid domain";
    }
  }

  // Job Type
  if (jobType !== undefined) {
    if (
      typeof jobType !== "string" ||
      jobType.trim().length === 0
    ) {
      errors.jobType = "Job type is required";
    }
  }

  // Eligibility
  if (eligibility !== undefined) {
    if (
      typeof eligibility !== "string" ||
      eligibility.trim().length === 0
    ) {
      errors.eligibility = "Eligibility is required";
    }
  }

  // Experience
  if (experience !== undefined) {
    if (
      typeof experience !== "string" ||
      experience.trim().length === 0
    ) {
      errors.experience = "Experience is required";
    }
  }

  // Active
  if (active !== undefined) {
    if (typeof active !== "boolean") {
      errors.active = "Active must be a boolean";
    }
  }

  // Form Link
  if (formLink !== undefined) {
    if (
      typeof formLink !== "string" ||
      formLink.trim().length === 0
    ) {
      errors.formLink = "Form link must be a non-empty string";
    } else {
      try {
        const url = new URL(formLink.trim());

        if (!["http:", "https:"].includes(url.protocol)) {
          errors.formLink =
            "Form link must be a valid HTTP or HTTPS URL";
        }
      } catch (error) {
        errors.formLink = "Form link must be a valid URL";
      }
    }
  }

  // Return validation errors
  if (Object.keys(errors).length > 0) {
    return res.status(400).json({
      success: false,
      message: "Validation failed",
      errors,
    });
  }

  // Store validated data
  req.validatedJobData = {
    ...(jobTitle !== undefined && {
      jobTitle: jobTitle.trim(),
    }),

    ...(jobDescription !== undefined && {
      jobDescription: jobDescription.trim(),
    }),

    ...(CTC !== undefined && {
      CTC,
    }),

    ...(deadLine !== undefined && {
      deadLine,
    }),

    ...(industries !== undefined && {
      industries: industries.trim(),
    }),

    ...(location !== undefined && {
      location: location.trim(),
    }),

    ...(domain !== undefined && {
      domain: domain.trim(),
    }),

    ...(jobType !== undefined && {
      jobType: jobType.trim(),
    }),

    ...(eligibility !== undefined && {
      eligibility: eligibility.trim(),
    }),

    ...(experience !== undefined && {
      experience: experience.trim(),
    }),

    ...(active !== undefined && {
      active,
    }),

    ...(formLink !== undefined && {
      formLink: formLink.trim(),
    }),
  };

  next();
};

module.exports = validateUpdateJob;