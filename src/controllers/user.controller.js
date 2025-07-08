import { asyncHandler } from "../utils/asyncHandler.js";
import { apiError } from "../utils/apiError.js";
import { User } from "../models/user.model.js";
import { uploadCloudinary } from "../utils/cloudinary.js";
import { ApiResponse } from "../utils/apiResponse.js";
import jwt from "jsonwebtoken"

//generating access and refresh token 
const generateAccessAndRefreshTokens = async (userId) => {
  try {
    const user = await User.findById(userId);

    if (!user) {
      throw new apiError(404, "User not found when generating tokens");
    }

    const accessToken = user.generateAccessToken();
    const refreshToken = user.generateRefreshToken();

    user.refreshTokens = refreshToken;
    await user.save({ validateBeforeSave: false });

    return {
      accessToken,
      refreshToken,
    };
  } catch (error) {
    console.error("Token generation error:", error);
    throw new apiError(500, "Something went wrong while generating tokens");
  }
};

//regiter user
const registerUser = asyncHandler(async (req, res) => {
  //get user details from frontend. kya details leni h wo user model pr hai jakr dekho
  //validation-not empty
  //check if user already exist ot not ??: check using email and username
  //whether file exist or not -- avatar and cover image
  //upload them to cloudinary,avatar
  //create user object -- create entry in DB
  //remove password and refresh token filed from response
  //check for user creation
  //return response else send error messsage

  const { username, fullname, email, password } = req.body;

  // you can also use if condition for each field
  if (
    [fullname, email, username, password].some((field) => field.trim() === "")
  ) {
    throw new apiError(400, "all fields are required");
  }

  const existedUser = await User.findOne({
    $or: [{ username }, { email }],
  });

  if (existedUser) {
    throw new apiError(409, "User with Email and username already exists");
  }

  console.log(req.files);

  const avatarLocalPath = req.files?.avatar?.[0]?.path;
  const coverImageLocalPath = req.files?.coverImage?.[0]?.path;

  if (!avatarLocalPath) {
    throw new apiError(400, "avatar is required");
  }

  const avatar = await uploadCloudinary(avatarLocalPath);
  const coverImage = await uploadCloudinary(coverImageLocalPath);

  if (!avatar) {
    throw new apiError(400, "avatar is necessary");
  }

  const user = await User.create({
    fullname,
    avatar: avatar.url,
    coverImage: coverImage?.url || "",
    email,
    password,
    username: username.toLowerCase(),
  });

  const createdUser = await User.findById(user._id).select(
    "-password -refreshTokens"
  );

  if (!createdUser) {
    throw new apiError(500, "something went wrong while registrating the user");
  }

  return res
    .status(201)
    .json(new ApiResponse(200, createdUser, "user registered successfully"));
});

//login user
const loginUser = asyncHandler(async (req, res) => {
  //req body se email and password lena hai
  //check if user exists or not using email
  //find the user
  //if user present then check for password
  //if password matches then create access token and refresh token
  //send cookies
  //send response with user details and tokens

  const { email, username, password } = req.body;

  if (!(username || email)) {
    throw new apiError(400, "Email, username, are required");
  }

  const user = await User.findOne({
    $or: [{ email }],
  });

  if (!user) {
    throw new apiError(404, "user does not exist with this mail and username");
  }

  const isPasswordValid = await user.isPasswordCorrect(password);

  if (!isPasswordValid) {
    throw new apiError(401, "Invalid User Credentials");
  }

  const { accessToken, refreshToken } = await generateAccessAndRefreshTokens(
    user._id
  );

  const loggedInUser = await User.findById(user._id).select(
    "-password -refreshTokens"
  );

  const options = {
    httpOnly: true,
    secure: true,
  };

  return res
    .status(200)
    .cookie("accessToken", accessToken, options)
    .cookie("refreshToken", refreshToken, options)
    .json(
      new ApiResponse(
        200,
        {
          user: loggedInUser,
          refreshToken,
        },
        "user Logged in successfully"
      )
    );
});

//logout
const logOutUser = asyncHandler(async (req, res) => {
  await User.findByIdAndUpdate(
    req.user._id,
    {
      $set: {
        refreshToken: undefined,
      },
    },
    {
      new: true,
    }
  );

  const options = {
    httpOnly: true,
    secure: true,
  };

  return res
    .status(200)
    .clearCookie("accessToken", options)
    .clearCookie("refreshToken", options)
    .json(new ApiResponse(200, {}, "user logged out successfully"));
});

//refresht= token access
const refreshTokenAccess = asyncHandler(async (req,res) =>{
  const incomingRefreshToken = req.cookies.refreshToken || req.body.refreshToken

  if (!incomingRefreshToken) {
    throw new apiError(401,"unauthorised request")
  }

  try {
    const decodedToken = jwt.verify(
      incomingRefreshToken,
      process.env.REFRESH_TOKEN_SECRET
    )
    const user = await User.findById(decodedToken?._id)
  
    if (!user) {
      throw new apiError(401,"invalid refresh Token")
    }
  
    if (incomingRefreshToken !== user?.refreshToken) {
      throw new apiError(401,"refresh token is expired or used")
    }
  
    const{accessToken,newRefreshToken} =  await generateAccessAndRefreshTokens(user._id)
  
    const options = {
      httpOnly:true,
      secure:true
    }
  
    return res
    .status(200)
    .cookie("accessToken",accessToken,options)
    .cookie("refreshToken",newRefreshToken,options)
    .json(
      new ApiResponse(200,
        {accessToken,newRefreshToken},
        "access token refreshed successfully"
      )
    )
  } catch (error) {
    throw new apiError(401,error?.message || "refresh token in invalid ")
  }
  
})

//updating the user password
const updateCurrentPassword = asyncHandler(async (req,res)=>{
  const {oldPassword,newPassword} =req.body

  const user = await User.findById(req.user?._id)
  const isPasswordCorrect = await user.isPasswordCorrect(oldPassword)
  if (!isPasswordCorrect) {
    throw new apiError(400,"invalid password"
    )
  }
  user.password=newPassword
  await user.save({validateBeforeSave:false})

  return res
  .status(200)
  .json(new ApiResponse(200,{},"password changed successfully"))

})

// getting current user
const getCurrentUser = asyncHandler(async(req,res)=>{
  return res.status(200).json(200,{},"current used fetched")
})

//updating other fields
const updateAccountDetails = asyncHandler(async(req,res)=>{
  const {fullname,email} = req.body

  if (!fullname || !email) {
    throw new apiError(400,"all fields are required")
  }

  const user = await User.findByIdAndUpdate(
    req.user?._id,
    {
      $set:{
        fullname,
        email
      }
    },
    {new:true}
  ).select("-password")
})

//updating the avatar
const updateAvatar = asyncHandler(async(req,res)=>{
  const avatarLocalPath = req.file?.path

  if (!avatarLocalPath) {
    throw new apiError(400,"avatar file is missing")
  }

  const avatar = await uploadCloudinary(avatarLocalPath)

  if (!avatar.url) {
  throw new apiError(400,"error in uploading the file")
}

const user = await User.findByIdAndUpdate(req.user?._id,
  {
    $set:{
      avatar:avatar.url
    }
  },
  {new:true}
).select("-password")

return res
.status(200)
.json(new ApiResponse(200,user,"avatar updated successfully"))

})

export {
  registerUser, 
  loginUser, 
  logOutUser,
  refreshTokenAccess,
  updateCurrentPassword,
  getCurrentUser,
  updateAccountDetails,
  updateAvatar
};
