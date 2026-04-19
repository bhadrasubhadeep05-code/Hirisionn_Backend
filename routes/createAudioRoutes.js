const express = require("express");
const router = express.Router();
const { createAudioCon } = require("../controllers/createAudioController");
const validateAudio = require("../middlewares/validateAudio");
const { getAllInterviewAudioCon, getAllIndustryAudioCon, getAllOtherAudiosCon } = require("../controllers/getAllAudioController");

// Create Audio
router.post("/audio", validateAudio, createAudioCon);

// Get All Interview Preparation Audios
router.get("/interview", getAllInterviewAudioCon);

// Get All Industry Updates Audios
router.get("/industry", getAllIndustryAudioCon);

// Get All Other Audios
router.get("/other", getAllOtherAudiosCon);

module.exports = router;
