import {asyncHandler} from "../utils/asyncHandler.js";
import { apiError } from "../utils/apiError.js";
import {User} from "../models/user.model.js"
import {uploadCloudinary} from "../utils/cloudinary.js"
import { ApiResponse } from "../utils/apiResponse.js";

const registerUser = asyncHandler( async(req,res) =>{
   // get user details from frontend. kya details leni h wo user model pr hai jakr dekho
   //validation-not empty
   //check if user already exist ot not ??: check using email and username
   //whether file exist or not -- avatar and cover image
   //upload them to cloudinary,avatar
   //create user object -- create entry in DB
   //remove password and refresh token filed from response 
   //check for user creation 
   //return response else send error messsage
   
   const{username,fullname,email,password} = req.body
   console.log("email",email);

   // you can also use if condition for each field
   if (
      [fullname,email,username,password].some((field) => 
      field.trim() ==="" )
   ) {
      throw new apiError(400,"all fields are required")
   }

   const existedUser = await User.findOne({
      $or:[{ username },{ email }]
   })

   if (existedUser) {
      throw new apiError(409,"User with Email and username already exists")
   }

   console.log(req.files);
   

   const avatarLocalPath = req.files?.avatar?.[0]?.path;
   const coverImageLocalPath = req.files?.coverImage?.[0]?.path;
   if (!avatarLocalPath) {
      throw new apiError(400,"avatar is required")      
   }

   
   const avatar = await uploadCloudinary(avatarLocalPath);
   const coverImage = await uploadCloudinary(coverImageLocalPath);

   
   if (!avatar) {
      throw new apiError(400,"avatar is necessary");
   }

   const user = await User.create({
      fullname,
      avatar: avatar.url,
      coverImage: coverImage?.url || "",
      email,
      password,
      username:username.toLowerCase()
   })

   const createdUser = await User.findById(user._id).select(
      "-password -refreshTokens"
   )

   if (!createdUser) {
      throw new apiError(500,"something went wrong while registrating the user")
   }

   return res.status(201).json(
      new ApiResponse(200,createdUser,"user registered successfully")
   )

} )


export {registerUser}