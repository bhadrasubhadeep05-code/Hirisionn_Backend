const express = require("express");
const router = express.Router();
const {getAudioCon, getWorkforceInsightsAudioCon, getIndustryInsightsAudioCon} = require("../controllers/getAllAudioController");


router.get('/blogs', getAudioCon);
router.get('/workforce-insights', getWorkforceInsightsAudioCon);
router.get('/industry-insights', getIndustryInsightsAudioCon);

module.exports = router;