const validateBase64 = require("../validation/validateBase64");

const validationImageBase64 = (req, res, next) =>{
    validateBase64(req.body.image);
    next();
}

module.exports =  validationImageBase64;