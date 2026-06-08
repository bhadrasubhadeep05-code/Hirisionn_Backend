const express = require('express');
require("dotenv").config();
const connectDB = require('./config/db');
const app = express();
const imageUploadRoute = require("./routes/uploadImage");
const deleteRoutes = require("./routes/deleteRoutes");
const PORT = process.env.PORT || 5000;
const createBlog = require("./routes/createBlog.js")
const createVideo = require("./routes/createVideoRoutes")
const getLatestBlog = require("./routes/getLatestBlog");
const getLatestVideo = require("./routes/getLatestVideo");
const getAllBlogs = require("./routes/getAllBlogs");
const getAllVideos = require("./routes/getAllVideo");
const getAllAudio = require("./routes/getAllAudio.js")
const user = require("./routes/user.js");
const admin = require("./routes/admin.js");
const createAudio = require("./routes/createAudioRoutes");
const business = require("./routes/Business.js")
const cookieParser = require("cookie-parser");
const cors =  require("cors");
const ApiError = require("./utils/ApiError.js")
connectDB();
require("dotenv").config();
const helmet = require("helmet");
const { globalLimiter } = require("./middlewares/rateLimiter.js");


app.set("trust proxy", 1);
app.use(helmet());
app.use(globalLimiter);

app.use(express.json({ limit: "10mb" }));
const allowedOrigins = [
  "http://localhost:5173",
  "https://hirisionn.com"
];

app.use(cors({
  origin: function (origin, callback) {
    // allow Postman / server-to-server (no origin)
    if (!origin) return callback(null, true);

    if (allowedOrigins.includes(origin)) {
      callback(null, true);
    } else {
      callback(new Error("Not allowed by CORS"));
    }
  },
  credentials: true,
}));

app.use(cookieParser());

//to check helth
app.get("/helth", (req, res)=>{

    console.log(token)
    res.status(200).json({
        helth: "UP AND RUNNING",
    })
})

// to upload image
app.use("/api/upload", imageUploadRoute);
//to delete image
app.use("/api/delete", imageUploadRoute);
// delete blog and video routes
app.use("/api/delete", deleteRoutes);
// create blog
app.use("/api/createblog", createBlog);
// create video
app.use("/api/createvideo", createVideo);
//get blog for landing page
app.use("/api/getlatestblog", getLatestBlog);
//get video for landing page
app.use("/api/getlatestvideo", getLatestVideo);
// get all blogs
app.use("/api/blog", getAllBlogs);
// get all videos
app.use("/api/video", getAllVideos);
// get all audio
app.use("/api/audio", getAllAudio);
//create audio
app.use("/api/createaudio", createAudio);
// user creat account
app.use("/api/createuser", user);
// user log in
app.use("/api/user", user);
// create audio
app.use("/api/createaudio", createAudio);
// user complete profile
app.use("/api/complete", user);
// admin routes
app.use("/api/admin", admin);
// business routes
app.use("/api/enquiry", business );


const errorMiddelware = require("./middlewares/errorMiddelware");
app.use(errorMiddelware);


app.listen(PORT, ()=>{
    console.log(`App is Running `)
})