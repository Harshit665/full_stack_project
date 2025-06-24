// whenever you tray to connect DB always use try-catch ot promises to handle errors
//DB is always in another content means it takes time so always use async await 

// require("dotenv").config({path:"./env"});
import dotenv from 'dotenv';
import connectDB from "./db/index.js";
import {app} from './app.js';

dotenv.config({path:"./env"});
connectDB()
.then(()=>{
    app.listen(process.env.PORT || 8000 , ()=>{
        console.log(`server is running at port ,${process.env.PORT}`);
        
    })
})
.catch((error)=>{
    console.log("MONGO DB connection FAILED", error);
    
}) 













// this is first approach to connect the database using the IIFEE standard
/* 
import express from "express";
const app = express();

;(async ()=>{
    try{
        await mongoose.connect(`${process.env.MONGODB_URI}/${DB_NAME}`) // connecting the database 
        app.on("error",(error)=>{ // adding listener sometime after connecting the database our express app may not able to connect to the database so we add the listener to handle the error
            console.log("ERROR",error);
            throw(error);   
        })

        app.listen(process.env.PORT,()=>{
            console.log(`App is listening on port ${process.env.PORT}`);
            
        })
    }
    catch(error){
        console.log("ERROR: ",error);
        throw error;
        
    }
})()
*/