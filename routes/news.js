const express = require('express');
const {
  getBusinessNewsController,
}= require("../controllers/news.controller");

const router = express.Router();

router.get("/business", getBusinessNewsController);

module.exports = router;