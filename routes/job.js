const express = require('express');
const router = express.Router();
const {createJob, getJobCardData, getJobData, deleteJobs, Applyjob, getJobAdmin, getApplicants, stateController, jobActiveToggel, updateJob } = require('../controllers/job.controller');
const validateJob = require('../middlewares/validateJob');
const validateUpdateJob = require('../middlewares/validateUpdateJob')
const verifyJWT = require("../middlewares/auth.middelware");

router.post('/create-job',verifyJWT, validateJob, createJob);
router.get('/all-jobs', getJobCardData);
router.get('/get-job/:id', getJobData);
router.delete('/delete-job/:id',verifyJWT, deleteJobs);
router.put('/apply-job',verifyJWT, Applyjob);

//admin get job
router.get('/get-jobs/admin', getJobAdmin);

//admin get applicants
router.get('/get-applicants/:jobId',verifyJWT, getApplicants);

//admin togglers
router.put('/job-state',verifyJWT, stateController);
router.put('/job-toggler',verifyJWT, jobActiveToggel);

//update job
router.put('/update-job/:jobId', validateUpdateJob, updateJob);


module.exports = router;