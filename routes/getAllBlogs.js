const express = require("express");
const router = express.Router();
const {getBlogsBlogCon, getWorkforceInsightsBlogCon, getIndustryInsightsBlogCon, getBlogById} = require("../controllers/getAllBlogsController");


router.get('/BlogData', getBlogsBlogCon);
router.get('/workforce', getWorkforceInsightsBlogCon);
router.get('/industry', getIndustryInsightsBlogCon);
router.get("/get-blog/:id", getBlogById)


module.exports = router;