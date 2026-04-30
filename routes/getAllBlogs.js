const express = require("express");
const router = express.Router();
const {getBlogsBlogCon, getWorkforceInsightsBlogCon, getIndustryInsightsBlogCon} = require("../controllers/getAllBlogsController");


router.get('/BlogData', getBlogsBlogCon);
router.get('/workforce', getWorkforceInsightsBlogCon);
router.get('/industry', getIndustryInsightsBlogCon);

module.exports = router;