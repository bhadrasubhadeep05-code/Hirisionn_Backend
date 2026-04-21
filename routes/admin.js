const express = require("express");
const router = express.Router();
const {
    loginAdmin,
    getAllUsers,
    downloadUserResume,
    exportUsersCSV,
    exportNewUsersCSV,
    getUserStats,
    getInternshipApplicants
} = require("../controllers/admin.controller");
const verifyJWT = require("../middlewares/auth.middelware");

router.post('/loginAdmin', loginAdmin);

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

module.exports = router;
