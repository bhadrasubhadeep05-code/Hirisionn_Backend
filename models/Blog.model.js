const mongoose = require("mongoose");

const blogSchema = new mongoose.Schema(
  {
    title: {
      required: true,
      type: String,
      trim: true,
      minlength: 5,
      maxlength: 150,
    },
    content: {
      required: true,
      type: String,
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
    imgLink:{
      type: String,
    },
    thumbnail: {
      url: String,
      public_id: String,
    },
  },
  { timestamps: true },
);
module.exports = mongoose.model("Blog", blogSchema);
