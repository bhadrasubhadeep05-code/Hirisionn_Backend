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
const user = require("./routes/user.js");
const admin = require("./routes/admin.js");
const createAudio = require("./routes/createAudioRoutes");
const cookieParser = require("cookie-parser");
const cors =  require("cors");
const ApiError = require("./utils/ApiError.js")
connectDB();
require("dotenv").config();
const helmet = require("helmet");
app.use(helmet());

app.use(express.json({ limit: "10mb" }));
app.use(express.urlencoded({ extended: true, limit: "10mb" }));
app.use(cors({
    origin: "http://localhost:5173",
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
app.use("/api/getallblogs", getAllBlogs);
// get all videos
app.use("/api/getallvideos", getAllVideos);
// get all audio
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


const errorMiddelware = require("./middlewares/errorMiddelware");
app.use(errorMiddelware);


app.listen(PORT, ()=>{
    console.log(`App is Running `)
})