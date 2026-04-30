const express = require("express");
const router = express.Router();
const {createVideo} = require("../controllers/createVideoController");
const ValidateVideo = require( "../middlewares/validateVideo");

router.post('/video',ValidateVideo, createVideo);


module.exports =  router;
