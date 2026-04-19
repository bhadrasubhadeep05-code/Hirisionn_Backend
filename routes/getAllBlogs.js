const express = require("express");
const router = express.Router();
const {getAllInterviewBlogCon, getAllIndustryBlogCon, getAllOtherBlogsCon} = require("../controllers/getAllBlogsController");


router.get('/interview', getAllInterviewBlogCon);
router.get('/industry', getAllIndustryBlogCon);
router.get('/other', getAllOtherBlogsCon);

module.exports = router;