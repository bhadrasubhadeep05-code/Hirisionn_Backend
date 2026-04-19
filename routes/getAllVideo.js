const express = require("express");
const router = express.Router();
const {getAllInterviewVideoCon, getAllIndustryVideoCon, getAllOtherVideosCon} = require("../controllers/getAllVideosController");


router.get('/interview', getAllInterviewVideoCon);
router.get('/industry', getAllIndustryVideoCon);
router.get('/other', getAllOtherVideosCon);

module.exports = router;