import { apiError } from "../utils/apiError";
import { asyncHandler } from "../utils/asyncHandler";
import jwt from "jsonwebtoken";
import {User} from "../models/user.model";


export const verifyJWT = asyncHandler(async (req ,_,next)=>{
   try {
     const token = req.cookies?.accessToken || req.header("Authorization")?.replace("Bearer ","");
     if(!token){
         throw new apiError(401, "unauthorised access, no token provided");
     }
 
     const decodedToken = jwt.verify(token,process.env.ACCESS_TOKEN_SECRET);
     const user = await User.findById(decodecToken?._id).select("-password -refreshToken")
 
     if (!user){
         throw new apiError(404, "Invalid Acccess Token,user not found");
     }
 
     req.user = user;
     next();
   } catch (error) {
    throw new apiError(401, "Invalid Access Token, please login again");
   }
})