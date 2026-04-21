const mongoose = require("mongoose");

const userSchema = new mongoose.Schema({
  // Form 1 (Required)
  fullName: {
    type: String,
    required: true,
    trim: true
  },
  email: {
    type: String,
    required: true,
    unique: true
  },
  phoneNo: {
    type: String,
    required: true
  },
  password: {
    type: String,
    required: true
  },

  securityQuestions: [
    {
      question: String,
      answer: String
    }
  ],

  // Form 2 (Optional)
  profile: {
    experienceLevel: String,
    job: String,
    employer: String,
    currentCTC: String,
    course: String,
    domain: String,
    education: String,
    linkedin: String,
    resume: {
      url: String,
      public_id: String,
      download_link: String,
    }
  },

  // IMPORTANT FLAG
  isProfileComplete: {
    type: Boolean,
    default: false
  },
  downloaded: {
    type: Boolean,
    default: false
  },
  
  // Track user internship interests
  internshipInterests: [
    {
      category: String,
      subCategory: String,
      appliedAt: {
        type: Date,
        default: Date.now
      }
    }
  ]
}, { timestamps: true });

// ✅ CREATE MODEL
const User = mongoose.model("User", userSchema);

// ✅ EXPORT MODEL
module.exports = User;