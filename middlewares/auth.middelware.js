const jwt = require("jsonwebtoken");
const ApiError = require("../utils/ApiError");

const verifyJWT = async (req, res, next) => {
  try {
    const tokenFromHeader = req.header("Authorization")?.replace("Bearer ", "");
    const tokenFromCookie = req.cookies?.token;
    const token = tokenFromCookie || tokenFromHeader;

    if (!token) {
      return res.status(401).json({ message: "No token provided" });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    req.user = decoded;
    next();
  } catch (error) {
    if (error.name === "TokenExpiredError") {
      return res.status(401).json({ message: "Token expired" });
    }

    return res.status(401).json({ message: "Invalid token" });
  }
};

module.exports = verifyJWT;
