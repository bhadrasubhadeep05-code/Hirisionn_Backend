const mongoose = require("mongoose");

const AudioSchema = new mongoose.Schema(
  {
    title: {
      required: true,
      type: String,
      trim: true,
      minlength: 5,
      maxlength: 150,
    },
    description: {
      type: String,
    },
    vid_link: {
      type: String,
      required: true,
      trim: true,
    },
    authorName: {
      type: String,
      trim: true,
      default: "Admin",
    },
    category: {
      type: String,
      required: true,
    },
  },
  { timestamps: true },
);
module.exports = mongoose.model("Audio", AudioSchema);
