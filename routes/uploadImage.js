const express = require("express");
const router = express.Router();
const {uploadImage} = require("../controllers/uploadController");
const { deleteImage } = require("../controllers/deleteImageController");
const validationImageBase64 = require( "../middlewares/validationImageBase64");
//upload image
router.post("/image", validationImageBase64, uploadImage);
//delete image
router.delete("/image", deleteImage);

module.exports =  router;