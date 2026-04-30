const express = require("express");
const router = express.Router();
const {getVideoCon, getWorkforceInsightsVideoCon, getIndustryInsightsVideoCon} = require("../controllers/getAllVideosController");


router.get('/videoData', getVideoCon);
router.get('/industry', getIndustryInsightsVideoCon);
router.get('/workforce', getWorkforceInsightsVideoCon);

module.exports = router;