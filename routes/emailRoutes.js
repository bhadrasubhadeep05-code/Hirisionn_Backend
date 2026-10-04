const express = require("express");

const verifyJWT = require("../middlewares/auth.middelware");

const { getEmails, reclassifyEmails, getEmailById, getEmailStats, syncEmails } = require("../controllers/email.controller");

const router = express.Router();

router.get("/", verifyJWT, getEmails);

router.get("/stats", verifyJWT, getEmailStats);

router.post("/sync", verifyJWT, syncEmails);

router.get("/:id", verifyJWT, getEmailById);

// router.patch("/reclassify", reclassifyEmails);

module.exports = router;