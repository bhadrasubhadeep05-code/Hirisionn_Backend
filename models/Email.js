const mongoose = require("mongoose");

const emailSchema = new mongoose.Schema(
  {
    messageId: {
      type: String,
      required: true,
      unique: true,
    },

    uid: {
      type: Number,
      required: true,
    },

    from: {
      name: String,
      email: String,
    },

    to: [
      {
        name: String,
        email: String,
      },
    ],

    subject: {
      type: String,
      default: "",
    },

    body: {
      type: String,
      default: "",
    },

    html: {
      type: String,
      default: "",
    },

    receivedAt: {
      type: Date,
    },

    // Email will automatically be deleted after 7 days
    expiresAt: {
      type: Date,
      default: () => new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
      index: {
        expires: 0,
      },
    },

    // Classification
    category: {
      type: String,
      enum: ["Tier 1", "Tier 2", "Other"],
      default: "Other",
    },

    subCategory: {
      type: String,
      default: null,
    },
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model("Email", emailSchema);