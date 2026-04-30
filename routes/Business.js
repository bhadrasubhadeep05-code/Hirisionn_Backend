const express = require("express");
const router = express.Router();
const {createBusinessEnquiry, getAllBusinessEnquiries} = require('../controllers/Business.controller');
const validateBusiness = require('../middlewares/BusinessValidator');
const verifyJWT = require("../middlewares/auth.middelware");

router.post('/create', validateBusiness, createBusinessEnquiry);

router.get('/', verifyJWT, getAllBusinessEnquiries);




module.exports = router;
