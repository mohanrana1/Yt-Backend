import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiError } from "../utils/ApiError.js";
import { User } from "../models/user.model.js";
import { uploadOnCloudinary } from "../utils/cloudinary.js";
import { ApiResponse } from "../utils/ApiResponse.js";

const registerUser = asyncHandler(async (req, res) => {
  // step to register user
  // 1. get user details from frontend ✅
  // 2. validation of data like not empty ✅
  // 3. check if user already exists (check either by username or email) ✅
  // 4. check for images, check for avatar ✅
  // 5. upload them to cloudinary, check for avatar ✅
  // 6. create user object - create entry in db ✅
  // 7. remove user password and refresh token field from response ✅
  // 8. check for uesr creation ✅
  // 9. return response


  //  1. get user details from frontend 

  console.log(req.body);

  const { fullName, email, username, password } = req.body;
  console.log("email: ", email);

  // 2. validation of data like not empty ✅
  if (
    // some methods test whether at least one element in an array meets a specified condition.
    [fullName, email, username, password].some((field) => field.trim() === "")
  ) {
    throw new ApiError(400, "All fields are required");
  }

 // 3. check if user already exists (check either by username or email) ✅

  const existedUser = User.findOne({
    $or: [{ username }, { email }],
  });

  console.log(existedUser);

  if (existedUser) {
    throw new ApiError(409, "User with email or username already exists");
  }


// 4. check for images, check for avatar ✅

  const avatarLocalPath = req.files?.avatar[0]?.path;
  const coverImageLocalPath = req.files?.coverImage[0]?.path;

  if(!avatarLocalPath){
    throw new ApiError(400, "Avatar file is required")
  }


 // 5. upload them to cloudinary,check for  avatar
 const avatar =  await uploadOnCloudinary(avatarLocalPath)
 const coverImage = await uploadOnCloudinary(coverImageLocalPath)

 if(!avatar) {
    throw new ApiError(400, "Avatar file is required")
 }

 // 6. create user object - create entry in db 
 const User = User.create({
    fullName,
    avatar: avatar.url,
    coverImage: coverImage?.url || "",
    email,
    password,
    username: username.toLowerCase()
 })


// 7. remove user password and refresh token field from response 
const createdUser = await User.findById(user._id).select(
"-password -refreshToken" //does not select these two field and select all other
)


// 8. check for uesr creation
 if(!createdUser){
    throw new ApiError(500,"something went wrong while regestring the user")
 }


// 9. return response
return res.status(201).json(
    new ApiResponse(200,createdUser, "User registered successfully")
)

});

export { registerUser };
