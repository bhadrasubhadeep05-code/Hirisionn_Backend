const Job = require("../models/Job.Model.js");
const User = require("../models/User.model.js");
const ApiResponse = require("../utils/ApiResponse.js");
const ApiError = require("../utils/ApiError.js");
const asyncHandler = require("../utils/asyncHandler.js");
const { sendEmail } = require("../utils/mailer.js");
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

// Helper to generate candidate status email content
const getCandidateStatusEmail = (state, candidateName, jobTitle) => {
  if (state === "Shortlisted") {
    const subject = `Shortlisted for Interview: ${jobTitle} | Hirisionn`;
    const text = `Dear ${candidateName},\n\nCongratulations!\n\nWe are pleased to inform you that you have been shortlisted for an interview for the ${jobTitle}.\nOur recruitment team will contact you with the interview details, including the date, time, and interview format, shortly.\n\nPlease keep an eye on your email for further communication and ensure that your contact details are up to date.\n\nWe look forward to speaking with you and learning more about your skills and experience.\n\nBest regards,\nHirisionn`;
    const html = `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Shortlisted for Interview</title>
</head>
<body style="margin: 0; padding: 0; background-color: #f8fafc; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; color: #1e293b;">
  <table width="100%" border="0" cellspacing="0" cellpadding="0" style="background-color: #f8fafc; padding: 40px 16px;">
    <tr>
      <td align="center">
        <table width="100%" border="0" cellspacing="0" cellpadding="0" style="max-width: 600px; background-color: #ffffff; border-radius: 16px; overflow: hidden; box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.05), 0 2px 4px -2px rgba(0, 0, 0, 0.05); border: 1px solid #e2e8f0;">
          <tr>
            <td style="background: linear-gradient(135deg, #4f46e5 0%, #6366f1 50%, #8b5cf6 100%); padding: 36px 32px; text-align: center;">
              <h1 style="color: #ffffff; margin: 0; font-size: 26px; font-weight: 800; letter-spacing: -0.5px;">Hirisionn</h1>
              <p style="color: #e0e7ff; margin: 6px 0 0 0; font-size: 14px; letter-spacing: 0.5px; text-transform: uppercase; font-weight: 600;">Recruitment Update</p>
            </td>
          </tr>
          <tr>
            <td style="padding: 36px 32px 28px 32px;">
              <p style="font-size: 16px; line-height: 24px; color: #334155; margin: 0 0 20px 0;">
                Dear <strong>${candidateName}</strong>,
              </p>
              <div style="background: #f0fdf4; border-left: 4px solid #22c55e; border-radius: 8px; padding: 18px 20px; margin: 0 0 24px 0;">
                <h2 style="color: #15803d; margin: 0 0 8px 0; font-size: 20px; font-weight: 700;">Congratulations!</h2>
                <p style="color: #166534; margin: 0; font-size: 15px; line-height: 22px;">
                  We are pleased to inform you that you have been <strong>shortlisted for an interview</strong> for the <strong>${jobTitle}</strong>.
                </p>
              </div>
              <p style="font-size: 15px; line-height: 24px; color: #475569; margin: 0 0 16px 0;">
                Our recruitment team will contact you with the interview details, including the <strong>date, time, and interview format</strong>, shortly.
              </p>
              <p style="font-size: 15px; line-height: 24px; color: #475569; margin: 0 0 16px 0;">
                Please keep an eye on your email for further communication and ensure that your contact details are up to date.
              </p>
              <p style="font-size: 15px; line-height: 24px; color: #475569; margin: 0 0 28px 0;">
                We look forward to speaking with you and learning more about your skills and experience.
              </p>
              <div style="border-top: 1px solid #f1f5f9; padding-top: 20px; margin-top: 24px;">
                <p style="font-size: 15px; line-height: 22px; color: #64748b; margin: 0;">
                  Best regards,<br>
                  <strong style="color: #0f172a; font-size: 16px;">Hirisionn</strong>
                </p>
              </div>
            </td>
          </tr>
          <tr>
            <td style="background-color: #f8fafc; padding: 20px 32px; text-align: center; border-top: 1px solid #e2e8f0;">
              <p style="color: #94a3b8; font-size: 12px; line-height: 18px; margin: 0;">
                This is an automated notification from Hirisionn. Please do not reply directly to this email.
              </p>
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>
    `;
    return { subject, text, html };
  }

  if (state === "Selected") {
    const subject = `Congratulations! You have been Selected for ${jobTitle} | Hirisionn`;
    const text = `Dear ${candidateName},\n\nCongratulations!\n\nWe are delighted to inform you that you have been selected for the ${jobTitle}.\n\nWe appreciate the effort you put into the recruitment process and were impressed with your qualifications and performance.\n\nOur team will contact you shortly with the next steps, including details regarding your joining date, required documentation, and other onboarding formalities.\n\nWe look forward to welcoming you to the team and wish you a successful journey.\n\nCongratulations once again!\n\nBest regards,\nHirisionn`;
    const html = `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Selected for Offer</title>
</head>
<body style="margin: 0; padding: 0; background-color: #f8fafc; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; color: #1e293b;">
  <table width="100%" border="0" cellspacing="0" cellpadding="0" style="background-color: #f8fafc; padding: 40px 16px;">
    <tr>
      <td align="center">
        <table width="100%" border="0" cellspacing="0" cellpadding="0" style="max-width: 600px; background-color: #ffffff; border-radius: 16px; overflow: hidden; box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.05), 0 2px 4px -2px rgba(0, 0, 0, 0.05); border: 1px solid #e2e8f0;">
          <tr>
            <td style="background: linear-gradient(135deg, #059669 0%, #10b981 50%, #34d399 100%); padding: 36px 32px; text-align: center;">
              <h1 style="color: #ffffff; margin: 0; font-size: 26px; font-weight: 800; letter-spacing: -0.5px;">Hirisionn</h1>
              <p style="color: #ecfdf5; margin: 6px 0 0 0; font-size: 14px; letter-spacing: 0.5px; text-transform: uppercase; font-weight: 600;">Offer & Selection</p>
            </td>
          </tr>
          <tr>
            <td style="padding: 36px 32px 28px 32px;">
              <p style="font-size: 16px; line-height: 24px; color: #334155; margin: 0 0 20px 0;">
                Dear <strong>${candidateName}</strong>,
              </p>
              <div style="background: #f0fdf4; border-left: 4px solid #10b981; border-radius: 8px; padding: 18px 20px; margin: 0 0 24px 0;">
                <h2 style="color: #065f46; margin: 0 0 8px 0; font-size: 20px; font-weight: 700;">Congratulations!</h2>
                <p style="color: #047857; margin: 0; font-size: 15px; line-height: 22px;">
                  We are delighted to inform you that you have been <strong>selected for the ${jobTitle}</strong>.
                </p>
              </div>
              <p style="font-size: 15px; line-height: 24px; color: #475569; margin: 0 0 16px 0;">
                We appreciate the effort you put into the recruitment process and were impressed with your qualifications and performance.
              </p>
              <p style="font-size: 15px; line-height: 24px; color: #475569; margin: 0 0 16px 0;">
                Our team will contact you shortly with the next steps, including details regarding your <strong>joining date, required documentation, and other onboarding formalities</strong>.
              </p>
              <p style="font-size: 15px; line-height: 24px; color: #475569; margin: 0 0 16px 0;">
                We look forward to welcoming you to the team and wish you a successful journey.
              </p>
              <p style="font-size: 15px; line-height: 24px; color: #047857; font-weight: 600; margin: 0 0 28px 0;">
                Congratulations once again!
              </p>
              <div style="border-top: 1px solid #f1f5f9; padding-top: 20px; margin-top: 24px;">
                <p style="font-size: 15px; line-height: 22px; color: #64748b; margin: 0;">
                  Best regards,<br>
                  <strong style="color: #0f172a; font-size: 16px;">Hirisionn</strong>
                </p>
              </div>
            </td>
          </tr>
          <tr>
            <td style="background-color: #f8fafc; padding: 20px 32px; text-align: center; border-top: 1px solid #e2e8f0;">
              <p style="color: #94a3b8; font-size: 12px; line-height: 18px; margin: 0;">
                This is an automated notification from Hirisionn. Please do not reply directly to this email.
              </p>
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>
    `;
    return { subject, text, html };
  }

  if (state === "Rejected") {
    const subject = `Update on your application for ${jobTitle} | Hirisionn`;
    const text = `Dear ${candidateName},\n\nThank you for your interest in the ${jobTitle} and for taking the time to complete the application process.\n\nAfter careful consideration, we regret to inform you that your application has not been selected to move forward in the recruitment process at this time.\n\nWe appreciate the time and effort you invested in applying. We encourage you to explore future opportunities with Hirisionn that may align with your skills and experience.\n\nWe wish you all the best in your career.\n\nBest regards,\nHirisionn`;
    const html = `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Application Status Update</title>
</head>
<body style="margin: 0; padding: 0; background-color: #f8fafc; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; color: #1e293b;">
  <table width="100%" border="0" cellspacing="0" cellpadding="0" style="background-color: #f8fafc; padding: 40px 16px;">
    <tr>
      <td align="center">
        <table width="100%" border="0" cellspacing="0" cellpadding="0" style="max-width: 600px; background-color: #ffffff; border-radius: 16px; overflow: hidden; box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.05), 0 2px 4px -2px rgba(0, 0, 0, 0.05); border: 1px solid #e2e8f0;">
          <tr>
            <td style="background: linear-gradient(135deg, #334155 0%, #475569 50%, #64748b 100%); padding: 36px 32px; text-align: center;">
              <h1 style="color: #ffffff; margin: 0; font-size: 26px; font-weight: 800; letter-spacing: -0.5px;">Hirisionn</h1>
              <p style="color: #cbd5e1; margin: 6px 0 0 0; font-size: 14px; letter-spacing: 0.5px; text-transform: uppercase; font-weight: 600;">Application Update</p>
            </td>
          </tr>
          <tr>
            <td style="padding: 36px 32px 28px 32px;">
              <p style="font-size: 16px; line-height: 24px; color: #334155; margin: 0 0 20px 0;">
                Dear <strong>${candidateName}</strong>,
              </p>
              <p style="font-size: 15px; line-height: 24px; color: #475569; margin: 0 0 16px 0;">
                Thank you for your interest in the <strong>${jobTitle}</strong> and for taking the time to complete the application process.
              </p>
              <div style="background: #f8fafc; border-left: 4px solid #94a3b8; border-radius: 8px; padding: 18px 20px; margin: 0 0 20px 0;">
                <p style="color: #334155; margin: 0; font-size: 15px; line-height: 22px;">
                  After careful consideration, we regret to inform you that your application has not been selected to move forward in the recruitment process at this time.
                </p>
              </div>
              <p style="font-size: 15px; line-height: 24px; color: #475569; margin: 0 0 16px 0;">
                We appreciate the time and effort you invested in applying. We encourage you to explore future opportunities with Hirisionn that may align with your skills and experience.
              </p>
              <p style="font-size: 15px; line-height: 24px; color: #475569; margin: 0 0 28px 0;">
                We wish you all the best in your career.
              </p>
              <div style="border-top: 1px solid #f1f5f9; padding-top: 20px; margin-top: 24px;">
                <p style="font-size: 15px; line-height: 22px; color: #64748b; margin: 0;">
                  Best regards,<br>
                  <strong style="color: #0f172a; font-size: 16px;">Hirisionn</strong>
                </p>
              </div>
            </td>
          </tr>
          <tr>
            <td style="background-color: #f8fafc; padding: 20px 32px; text-align: center; border-top: 1px solid #e2e8f0;">
              <p style="color: #94a3b8; font-size: 12px; line-height: 18px; margin: 0;">
                This is an automated notification from Hirisionn. Please do not reply directly to this email.
              </p>
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>
    `;
    return { subject, text, html };
  }

  return null;
};

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

    // Send email notification for Shortlisted, Selected, or Rejected states
    if (user.email && ["Shortlisted", "Selected", "Rejected"].includes(normalizedState)) {
      try {
        let jobTitle = placement.jobTitle;
        if (!jobTitle) {
          const job = await Job.findById(jobId).select("jobTitle");
          if (job) {
            jobTitle = job.jobTitle;
          }
        }
        jobTitle = jobTitle || "the position";

        const candidateName = user.fullName || "Candidate";
        const emailContent = getCandidateStatusEmail(normalizedState, candidateName, jobTitle);

        if (emailContent) {
          await sendEmail({
            to: user.email,
            subject: emailContent.subject,
            text: emailContent.text,
            html: emailContent.html,
            from: `"Hirisionn Recruitment" <${process.env.GMAIL_USER}>`,
          });
        }
      } catch (emailError) {
        console.error(`Failed to send ${normalizedState} email notification:`, emailError.message);
      }
    }

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