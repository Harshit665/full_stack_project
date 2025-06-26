import express from "express";
import cors from "cors"; // what is cors ??
import cookieParser from "cookie-parser"; // what is body parser and multer ?? also read what is JSON data and object data 

const app = express();

app.use(cors({
    origin:process.env.CORS_ORIGIN,
    credentials:true
}))

app.use(express.json({limit:"16kb"})) // this helps in taking data from the form like things like in object and json form but what about data from the URL

app.use(express.urlencoded({extended:true,limit:"16kb"})) // this helps in taking data from the URL 

app.use(express.static("public"))// if i want to store some pdf , image and other data in my server publicly then this helps

app.use(cookieParser()) // iska kaam sirf itna sa h ki mai mere server s jo user ka browser k andar ki cooikies ko mai access kr pau aur set kr pau

// read about Middleware and flag (like next flag)

//routes
//import userRouter from "./routes/user.routes.js";
import router from "./routes/user.routes.js";

app.use("/api/v1/users",router);


export {app};