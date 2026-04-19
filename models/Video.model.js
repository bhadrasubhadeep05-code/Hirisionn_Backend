const mongoose = require("mongoose");

const videoSchema = new mongoose.Schema(
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
    category: {
      type: String,
      required: true,
    },
  },
  { timestamps: true },
);
module.exports = mongoose.model("Video", videoSchema);
