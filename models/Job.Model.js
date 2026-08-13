const mongoose = require("mongoose");

const jobSchema = new mongoose.Schema(
  {
    jobTitle: {
      required: true,
      type: String,
      trim: true,
      minlength: 5,
      maxlength: 150,
    },
    jobDescription: {
      required: true,
      type: String,
      trim: true,
    },
    CTC: {
      required: true,
      type: String,
      trim: true,
    },
    deadLine: {
      required: true,
      type: Date,
      trim: true,
    },
    industries: {
      require: true,
      type: String,
      trim: true,
    },
    location: {
      required: true,
      type: String,
      trim: true,
    },
    domain: {
      required: true,
      type: String,
      trim: true,
    },
    jobType: {
      required: true,
      type: String,
      trim: true,
    },
    eligibility: {
      required: true,
      type: String,
      trim: true,
    },
    experience: {
      required: true,
      type: String,
      trim: true,
    },
    active:{
      type: Boolean,
      default: true,
    },
   users: [
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
    },
  },
],
  formLink: {
    type: String,
  }
  },
  { timestamps: true },
);
module.exports = mongoose.model("Job", jobSchema);