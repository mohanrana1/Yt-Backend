import mongoose, { Schema } from "mongoose";
import jwt from "jsonwebtoken";// generate and handle token
import bcrypt from "bcrypt" // encrypt and decrypt the user's credentials


const userSchema = new Schema(
  {
    username: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
      index: true, //for making searching optimized
    },
    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
    },
    fullName: {
      type: String,
      required: true,
      trim: true,
      index: true,
    },
    avatar: {
      type: String, //cloudinary url
      required: true,
    },
    coverImage: {
      type: String, // Cloudinary
    },
    watchHistory: [
      {
        type: Schema.Types.ObjectId,
        ref: "Video",
      },
    ],
    password: {
      type: String,
      required: [true, "password is required"],
    },
    refreshToken: {
      type: String,
    },
  },
  { timestamps: true }
);


// `pre` is a Mongoose middleware function that runs before a certain action (like saving) is performed on the document.
// We use `async` because encryption is an asynchronous operation that may take some time to complete.

// Arrow functions do not have their own this context; 
// they inherit this from the surrounding lexical context. In Mongoose middleware, the this keyword needs to refer to the document being saved or processed. 
// Therefore, a regular function (not an arrow function) should be used to correctly bind this to the Mongoose document.

userSchema.pre("save", async function (next) {
    if(this.isModified("password")){
        this.password = await bcrypt.hash(this.password, 10)
    }    
    next()
} )


userSchema.methods.isPasswordCorrect = async function (password) {
    return await bcrypt.compare(password, this.password)
}

userSchema.methods.generateAccessToken = function (){
   return jwt.sign(
        {
            _id: this.id,
            email: this.email,
            username: this.username,
            fullName: this.fullName
        },
        process.env.ACCESS_TOKEN_SECRET,
        {
            expiresIn: process.env.ACCESS_TOKEN_EXPIRY
        }
    )
}


userSchema.methods.generateRefreshToken = function (){
    return jwt.sign(
        {
            _id: this.id,      
        },
        process.env.REFRESH_TOKEN_SECRET,
        {
            expiresIn: process.env.ACCESS_TOKEN_EXPIRY
        }
    )
}

export const User = mongoose.model("User", userSchema); // in mongodb User is saved as 'users'
