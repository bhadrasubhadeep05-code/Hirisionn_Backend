const express = require("express");
const router = express.Router();
const {createBlog} = require("../controllers/createBlogController.js");
const validateBlog =  require("../middlewares/validateBlog");

router.post('/blog',validateBlog, createBlog);

module.exports =  router;
