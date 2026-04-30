const express = require("express");
const router = express.Router();
const { createAudioCon } = require("../controllers/createAudioController");
const validateAudio = require("../middlewares/validateAudio");

// Create Audio
router.post("/audio", validateAudio, createAudioCon);


module.exports = router;
