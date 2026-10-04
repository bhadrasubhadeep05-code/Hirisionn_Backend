const mongoose = require("mongoose");

const emailSyncStateSchema = new mongoose.Schema(
  {
    email: {
      type: String,
      required: true,
      unique: true,
    },

    mailbox: {
      type: String,
      default: "INBOX",
    },

    uidValidity: {
      type: String,
      required: true,
    },

    lastUid: {
      type: Number,
      required: true,
    },

    initializedAt: {
      type: Date,
      default: Date.now,
    },
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model("EmailSyncState", emailSyncStateSchema);