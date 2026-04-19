const express = require("express");
const router = express.Router();
const { deleteBlog } = require("../controllers/deleteBlogController");
const { deleteVideo } = require("../controllers/deleteVideoController");
const verifyJWT = require("../middlewares/auth.middelware");

// Protected delete routes (admin only)
router.delete('/blog/:blogId', verifyJWT, deleteBlog);
router.delete('/video/:videoId', verifyJWT, deleteVideo);

module.exports = router;