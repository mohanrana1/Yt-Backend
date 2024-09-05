import { ApiError } from "../utils/ApiError.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import  jwt  from "jsonwebtoken";
import { User } from "../models/user.model.js";

//to vefify the accessToken

export const verifyJWT = asyncHandler(async(req,res,next) => {
    try {
        const token = req.cookies?.accessToken || req.header("Authorization")?.replace("Bearer ", "")
    
        if(!token){
            throw new ApiError(401, "unauthorized request")
        }
    
        const decodedToken = jwt.verify(token, process.env.ACCESS_TOKEN_SECRET)


       const user = await User.findById(decodedToken?._id).select("-password -refreshToken")

       if(!user){
        throw new ApiError(403, "Inavalid Access Token")
       }

       req.user = user;  // If the token is valid and the user exists, the user object is attached to the req object (i.e., req.user = user). This makes the user information available to subsequent middleware or route handlers.
       next()

    } catch (error) {
        throw new ApiError(401, error?.message || "Invalid access Token")
    }
})
