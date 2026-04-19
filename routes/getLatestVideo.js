const express = require("express");
const router = express.Router();
const {getLetastInterviewVideoCon , getLetastIndustryVideoCon} = require("../controllers/getLatestVideo.controller");

router.get('/interview', getLetastInterviewVideoCon);
router.get('/industry', getLetastIndustryVideoCon);

module.exports = router;