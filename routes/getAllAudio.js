const express = require("express");
const router = express.Router();
const {getAudioCon, getWorkforceInsightsAudioCon, getIndustryInsightsAudioCon} = require("../controllers/getAllAudioController");


router.get('/audioData', getAudioCon);
router.get('/industry', getIndustryInsightsAudioCon);
router.get('/workforce', getWorkforceInsightsAudioCon);

module.exports = router;