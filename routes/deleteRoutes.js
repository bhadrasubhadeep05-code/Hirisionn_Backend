const express = require("express");
const router = express.Router();
const { deleteBlog } = require("../controllers/deleteBlogController");
const { deleteVideo } = require("../controllers/deleteVideoController");
const {deleteAudio} = require("../controllers/deleteAudioController")
const verifyJWT = require("../middlewares/auth.middelware");

// Protected delete routes (admin only)
router.delete('/blog/:blogId', verifyJWT, deleteBlog);
router.delete('/video/:videoId', verifyJWT, deleteVideo);
router.delete('/audio/:audioId', verifyJWT, deleteAudio);

module.exports = router;