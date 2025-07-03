import mongoose, { Schema } from "mongoose";
import jwt from "jsonwebtoken";
import bcrypt from "bcrypt";
//what is middleware hooks like pre , post etc

const userSchema = new mongoose.Schema(
  {
    username: {
      type: String,
      required: true,
      unique: true,
      lowecase: true,
      trim: true,
      index: true, // is we need any field searchable in optimized way then we use index
    },
    email: {
      type: String,
      required: true,
      unique: true,
      lowecase: true,
      trim: true,
    },
    fullname: {
      type: String,
      required: true,
      trim: true,
    },
    avatar: {
      type: String // cloudinary URL
    },
    coverImage: {
      type: String, // cloudinary URL
    },
    watchHistory: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Video",
      },
    ],
    password: {
      type: String,
      required: [true, "password is required"],
    },
    refreshTokens: {
      type: String,
    },
  },
  { timestamps: true }
);

 // hame yha krna kya h to password field ko lo encrypt kro aur save kra do

 // yha par hum chhota sa middleware lga rhe h agr password modified nhi hua h to modified mat kro
userSchema.pre("save", async function (next) {
    if(!this.isModified("password")) return next();
 
  this.password = await bcrypt.hash(this.password, 10); // hash is a function it takes two things pehla kya hash krna h second kitne rounds lagau like 8 , 10 ,default
  next(); // ab next krne pr prblm aai ki jb bhi hum kuchh bhi change krenge jaise avatar photo anything to ye next kya krega password chnage kr dega mtlb kuchh bhi update krenge to change krta rhega hme chahiye sirf password field change krne pr change ho so if condition lagani padegi 
}); // this take functionality and then a callback but the call back not in arrow function read the documentation mongoose middleware

// password checking 

userSchema.methods.isPasswordCorrect = async function(password){
   return await bcrypt.compare(password,this.password) // compare method return data in true or false 
}

//generating access token 
userSchema.methods.generateAccessToken = function(){
    return jwt.sign(
        {
            _id:this._id,
            email:this.email,
            username:this.username,
            fullname:this.fullname
        },
        process.env.ACCESS_TOEKN_SECRET,
        {
            expiresIn:process.env.ACCESS_TOEKN_EXPIRY
        }
    )
}

// generating the refresh token
userSchema.methods.generateRefreshToken =  function(){
    return jwt.sign(
        {
            _id:this._id,
        },
        process.env.REFRESH_TOKEN_SECRET,
        {
            expiresIn:process.env.REFRESH_TOKEN_EXPIRY
        }
    )
}

export const User = mongoose.model("User", userSchema);
