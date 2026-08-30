const Job = require("../models/Job.Model.js");
const User = require("../models/User.model.js");
const ApiResponse = require("../utils/ApiResponse.js");
const ApiError = require("../utils/ApiError.js");
const asyncHandler = require("../utils/asyncHandler.js");
const jwt = require("jsonwebtoken");
const bcrypt = require("bcryptjs");

// create job post

exports.createJob = asyncHandler(async (req, res) => {
  try {
    const validatedData = req.validatedJobData || req.body;

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
    } = validatedData;

    const jobData = await Job.create({
      jobTitle,
      jobDescription,
      CTC: String(CTC),
      deadLine,
      industries,
      location,
      domain,
      jobType,
      eligibility,
      experience,
      active: typeof active === "boolean" ? active : true,
      formLink,
    });

    res.status(200).json({
      data: jobData,
      success: true,
      message: "Job post created successfully",
    });
  } catch (error) {
    res.status(500).json(
      new ApiResponse(
        500,
        null,
        "Something went wrong when creating the job post error: " + error,
      ),
    );
  }
});

//get job card data
exports.getJobCardData = asyncHandler(async (req, res) => {
  try {
    const jobs = await Job.find({ active: true })
      .sort({ createdAt: -1 })
      .select(
        "jobTitle CTC deadLine industries location domain jobType eligibility experience formLink",
      );

    if (!jobs) {
      return res.status(404).json({
        success: false,
        message: "Job not found",
      });
    }

    res.status(200).json(new ApiResponse(200, jobs, "got all the job data"));
  } catch (error) {
    res.status(500).json({ error: "Failed to get data error: " + error });
  }
});

//get job data by id
exports.getJobData = asyncHandler(async (req, res) => {
  try {
    const id = req.params.id;
    const job = await Job.findById(id).select(
      "jobTitle jobDescription CTC deadLine industries location domain jobType eligibility experience formLink",
    );

    if (!job) {
      return res.status(404).json({
        success: false,
        message: "Job not found",
      });
    }

    res.status(200).json(new ApiResponse(200, job, "got the job data"));
  } catch (error) {
    res.status(500).json({ error: "Failed to get data error: " + error });
  }
});

//delete jobs Data
exports.deleteJobs = asyncHandler(async (req, res) => {
  try {
    const id = req.params.id;
    const job = await Job.findByIdAndDelete(id);

    res.status(200).json(new ApiResponse(200, null, "delete successfully"));
  } catch (error) {
    res.status(500).json({ error: "Failed to delete data error: " + error });
  }
});

// Apply Job
exports.Applyjob = asyncHandler(async (req, res) => {
  try {
    const { userId, id } = req.body;
    const jobId = id;

    if (!jobId || typeof jobId !== "string") {
      return res.status(400).json({
        error: "JobId is required and must be a string",
      });
    }

    if (!userId || typeof userId !== "string") {
      return res.status(400).json({
        error: "UserId is required and must be a string",
      });
    }

    const job = await Job.findById(jobId);

    if (!job) {
      return res.status(404).json({
        error: "Job not found",
      });
    }

    const user = await User.findById(userId);

    if (!user) {
      return res.status(404).json({
        error: "User not found",
      });
    }

    // Check if user has already applied
    const alreadyApplied = user.jobPlacement.some(
      (item) => item.jobId && item.jobId.equals(job._id),
    );

    if (alreadyApplied) {
      return res.status(400).json({
        error: "Already Applied",
      });
    }

    // Add job to user's applied jobs
    user.jobPlacement.push({
      jobId: job._id,
      jobTitle: job.jobTitle,
      status: "Applied",
    });

    // Add user to job applicants
    job.users.push({
      userId: user._id,
    });

    await user.save();
    await job.save();

    return res
      .status(200)
      .json(new ApiResponse(200, null, "Applied Successfully"));
  } catch (error) {
    console.error("Apply Job Error:", error);

    return res.status(500).json({
      success: false,
      message: error.message || "Internal Server Error",
    });
  }
});

//get job all admin
exports.getJobAdmin = asyncHandler(async (req, res) => {
  try {
    const jobs = await Job.find().sort({ createdAt: -1 });

    if (!jobs) {
      return res.status(404).json({
        success: false,
        message: "Job not found",
      });
    }

    res.status(200).json(new ApiResponse(200, jobs, "got all the job data"));
  } catch (error) {
    res.status(500).json({ error: "Failed to get data error: " + error });
  }
});



//get applicant details
exports.getApplicants = asyncHandler(async (req, res) => {
  try {
    const { jobId } = req.params;

    const job = await Job.findById(jobId);

    if (!job) {
      return res.status(404).json({
        success: false,
        message: "Job not found",
      });
    }

    const userIds = job.users.map((user) => user.userId);

    const users = await User.find({
      _id: { $in: userIds },
    }).select("fullName email phoneNo jobPlacement");

    const applicants = users.map((user) => {
      const application = user.jobPlacement.find((jp) =>
        jp.jobId.equals(job._id),
      );

      return {
        userId: user._id,
        fullName: user.fullName,
        email: user.email,
        phoneNo: user.phoneNo,
        status: application?.status || "Not Applied",
      };
    });

    return res.status(200).json({
      success: true,
      data: applicants,
      jobData: job,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
});

//user job status control
exports.stateController = asyncHandler(async (req, res) => {
  try {
    const { id, jobId, state } = req.body;

    if (!id || typeof id !== "string") {
      return res.status(400).json({
        success: false,
        message: "User id is required",
      });
    }

    if (!jobId || typeof jobId !== "string") {
      return res.status(400).json({
        success: false,
        message: "Job id is required",
      });
    }

    const validStates = [
      "Applied",
      "Selected",
      "Rejected",
      "Shortlisted",
      "Sortlisted",
      "applied",
      "selected",
      "rejected",
      "shortlisted",
      "sortlisted",
    ];

    if (typeof state !== "string" || !validStates.includes(state)) {
      return res.status(400).json({
        success: false,
        message: "state must be one of: Applied, Shortlisted, Selected, Rejected",
      });
    }

    let normalizedState = state.charAt(0).toUpperCase() + state.slice(1).toLowerCase();
    if (normalizedState === "Sortlisted") {
      normalizedState = "Shortlisted";
    }

    const user = await User.findById(id);

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    const placement = user.jobPlacement.find(
      (item) => item.jobId && item.jobId.toString() === jobId,
    );

    if (!placement) {
      return res.status(404).json({
        success: false,
        message: "Job application not found for this user",
      });
    }

    placement.status = normalizedState;
    await user.save();

    return res.status(200).json({
      success: true,
      data: user,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
});

// job post active control
exports.jobActiveToggel = asyncHandler(async (req, res) => {
  try {
    const { id, state } = req.body;

    if (typeof state !== "boolean") {
      return res.status(400).json({
        success: false,
        message: "state needs to be a boolean",
      });
    }

    const job = await Job.findById(id);

    if (!job) {
      return res.status(404).json({
        success: false,
        message: "Job not found",
      });
    }

    job.active = state;
    await job.save();

    return res.status(200).json({
      success: true,
      data: job,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
});

// updateJob 
exports.updateJob = asyncHandler(async (req, res) => {
  try {
    const { jobId } = req.params;
    const validatedData = req.validatedJobData;

    // Find the existing job
    const job = await Job.findById(jobId);

    if (!job) {
      return res.status(404).json(
        new ApiResponse(
          404,
          null,
          "Job post not found"
        )
      );
    }

    // Update only the fields that were provided
    if (validatedData.jobTitle !== undefined) {
      job.jobTitle = validatedData.jobTitle;
    }

    if (validatedData.jobDescription !== undefined) {
      job.jobDescription = validatedData.jobDescription;
    }

    if (validatedData.CTC !== undefined) {
      job.CTC = String(validatedData.CTC);
    }

    if (validatedData.deadLine !== undefined) {
      job.deadLine = validatedData.deadLine;
    }

    if (validatedData.industries !== undefined) {
      job.industries = validatedData.industries;
    }

    if (validatedData.location !== undefined) {
      job.location = validatedData.location;
    }

    if (validatedData.domain !== undefined) {
      job.domain = validatedData.domain;
    }

    if (validatedData.jobType !== undefined) {
      job.jobType = validatedData.jobType;
    }

    if (validatedData.eligibility !== undefined) {
      job.eligibility = validatedData.eligibility;
    }

    if (validatedData.experience !== undefined) {
      job.experience = validatedData.experience;
    }

    if (validatedData.active !== undefined) {
      job.active = validatedData.active;
    }

    if (validatedData.formLink !== undefined) {
      job.formLink = validatedData.formLink;
    }

    // Save updated job
    const updatedJob = await job.save();

    return res.status(200).json(
      new ApiResponse(
        200,
        updatedJob,
        "Job post updated successfully"
      )
    );

  } catch (error) {
    return res.status(500).json(
      new ApiResponse(
        500,
        null,
        "Something went wrong when updating the job post: " +
          error.message
      )
    );
  }
});