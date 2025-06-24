import mongoose from "mongoose";
import { DB_NAME } from "../constants.js";


const connectDB = async ()=>{
    try {
        const connectionInstance = await mongoose.connect(`${process.env.MONGODB_URI}/${DB_NAME}`)
        console.log(`\n MongoDB connected !! DB host : ${connectionInstance.connect.host}`);
        
    } catch (error) {
        console.log("MONGODB connection error",error);
        process.exit(1) // it is a process present in node.js which is running currently and process is written to take refrence and exit 
    }
}

export default connectDB;