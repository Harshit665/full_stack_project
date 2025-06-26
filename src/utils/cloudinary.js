import { v2 as cloudinary } from "cloudinary";
import fs from "fs";

// Configuration
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_CLOUD_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET, // Click 'View API Keys' above to copy your API secret
});


const uploadCloudinary = async (localFilePath)=>{
    try{
        if(!localFilePath) return null
        //uplaoding the file on cloudinary
        const response = await cloudinary.uploader.upload(localFilePath,{
            resource_type:"auto"
        })
        console.log("the file upladed successfully dude",response.url);
        return response;
    }
    catch(error){
        fs.unlinkSync(localFilePath) // remove the locally saved temporary filr as the upload operaton got failed
        console.log(error);
    }
}

export { uploadCloudinary };        