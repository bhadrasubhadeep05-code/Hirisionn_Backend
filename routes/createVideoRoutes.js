const express = require("express");
const router = express.Router();
const {createVideo} = require("../controllers/createVideoController");
const ValidateVideo = require( "../middlewares/validateVideo");
const {getAllInterviewVideoCon, getAllIndustryVideoCon, getAllOtherVideosCon} = require("../controllers/getAllVideosController");

router.post('/video',ValidateVideo, createVideo);

// Get All Videos
router.get('/interview', getAllInterviewVideoCon);
router.get('/industry', getAllIndustryVideoCon);
router.get('/other', getAllOtherVideosCon);

module.exports =  router;
