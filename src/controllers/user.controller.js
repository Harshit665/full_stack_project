import { asyncHandler } from "../utils/asyncHandler.js";
import { apiError } from "../utils/apiError.js";
import { User } from "../models/user.model.js";
import { uploadCloudinary } from "../utils/cloudinary.js";
import { ApiResponse } from "../utils/apiResponse.js";

const generateAccessAndRefreshTokens = async (userId) => {
  try {
    const user = await User.findById(userId);
    const accessToken = user.generateAccessToken();
    const refreshToken = user.generateRefreshToken();

    user.refreshTokens = refreshToken;
    await user.save({ validateBeforeSave: false });

    return {
      accessToken,
      refreshToken,
    };
  } catch (error) {
    throw new apiError(500, "somethinf went wrong while generating tokens");
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

  if (!username || !email) {
    throw new apiError(400, "Email, username, are required");
  }

  const user = await User.findOne({
    $or: [{ email }, { username: username.toLowerCase() }],
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

  const loggedInUser = await user
    .findById(user._id)
    .select("-password -refreshTokens");

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
  await User.findByIdAndUpdate(req.user._id, {
    $set: {
      refreshToken: undefined,
    }
  },
  {
   new:true
  }
);

const options = {
   httpOnly: true,
   secure: true,
   }

   return res
   .status(200)
   .clearCookie("accessToken", options)
   .clearCookie("refreshToken", options)
   .json(new ApiResponse(200, {}, "user logged out successfully"));

});

export { registerUser, loginUser, logOutUser };
