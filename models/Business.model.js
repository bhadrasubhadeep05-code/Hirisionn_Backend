const mongoose = require("mongoose");

const BusinessModel = new mongoose.Schema(
  {
    fullname: {
      required: true,
      type: String,
      trim: true,
    },
    email: {
      type: String,
       required: true,
        trim: true,
    },
    organizationName: {
      type: String,
      required: true,
      trim: true,
    },
      designation: {  
      type: String,
      required: true,
      trim: true,
    },

    phoneNumber: {
      type: String,
      required: true,
      trim: true,
    },

    location: {  
      type: String,
      required: true,
      trim: true,
    },

    enquiryFor: {  
      type: String,
      required: true,
      trim: true,
    },

    message: {  
      type: String,
      required: true,
      trim: true,
    },
   
  },
  { timestamps: true },
);
module.exports = mongoose.model("Business", BusinessModel);
