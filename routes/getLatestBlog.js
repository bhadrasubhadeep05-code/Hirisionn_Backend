const express = require("express");
const router = express.Router();
const {getLetastInterviewBlogCon , getLetastIndustryBlogCon} = require("../controllers/getLatestBlogController");

router.get('/interview', getLetastInterviewBlogCon);
router.get('/industry', getLetastIndustryBlogCon);

module.exports = router;