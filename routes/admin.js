const express = require("express");
const router = express.Router();
const {
    loginAdmin,
    logoutAdmin,
    getAllUsers,
    downloadUserResume,
    exportUsersCSV,
    exportNewUsersCSV,
    getUserStats,
    getInternshipApplicants,
    markInternshipAsFulfilled,
    getInternshipFulFilled,
  softSkillApplication,
  getSoftSkillStatus,
  markSoftSkillAsFulfilled
} = require("../controllers/admin.controller");
const verifyJWT = require("../middlewares/auth.middelware");
const rateLimit = require("express-rate-limit");


const loginLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 10,
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    success: false,
    message: "Too many login attempts. Please try again later.",
  },
});

router.post('/loginAdmin',loginLimiter, loginAdmin);
router.post('/logout', logoutAdmin);

// Protected admin routes
router.get('/users', verifyJWT, getAllUsers);

// Sanitize ObjectId parameter before passing to controller
router.post('/users/:id/download-resume', verifyJWT, (req, res, next) => {
  // Clean ID at route level first - remove all non-hex characters
  req.params.id = req.params.id.trim().replace(/[^a-fA-F0-9]/g, '');
  next();
}, downloadUserResume);
router.get('/users/export/csv', verifyJWT, exportUsersCSV);
router.get('/users/export/csv/new', verifyJWT, exportNewUsersCSV);
router.get('/users/stats', verifyJWT, getUserStats);

// Internship applicants route
router.get('/internship-applicants', verifyJWT, getInternshipApplicants);
router.put('/internship-status', verifyJWT, markInternshipAsFulfilled);
router.get('/internship-fulfill', verifyJWT, getInternshipFulFilled);


//Soft Skill Routes
router.put('/softskills', verifyJWT, softSkillApplication);
router.get('/softskills-applicants', verifyJWT, getSoftSkillStatus);
router.put('/softskills-status', verifyJWT, markSoftSkillAsFulfilled);


module.exports = router;
