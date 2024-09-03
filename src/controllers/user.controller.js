import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiError } from "../utils/ApiError.js";
import { User } from "../models/user.model.js";
import { uploadOnCloudinary } from "../utils/cloudinary.js";
import { ApiResponse } from "../utils/ApiResponse.js";


const generateAccessAndRefreshTokens = async(userId) => {
  try{
    const existedUser = await User.findById(userId);
    const accessToken = User.generateAccessToken();
    const refreshToken = User.generateRefreshToken();
    
    existedUser.refreshToken = refreshToken
    await existedUser.save({ validateBeforeSave: false })

    return { accessToken , refreshToken }

  } catch(error) {
    throw new ApiError(500, "something went wrong while generating refresh and access token")
  }
}

const registerUser = asyncHandler(async (req, res) => {
  // step to register user
  // 1. get user details from frontend ✅
  // 2. validation of data like not empty ✅
  // 3. check if user already exists (check either by username or email) ✅
  // 4. check for images, check for avatar ✅
  // 5. upload them to cloudinary, check for avatar ✅
  // 6. create user object - create entry in db ✅
  // 7. remove user password and refresh token field from response ✅
  // 8. check for user creation ✅
  // 9. return response

  // 1. get user details from frontend
  console.log("NEW LOG STARTS FROM HERE: -")
  console.log("req.body from userController is:", req.body);

  const { fullName, email, username,password } = req.body;

  // 2. validation of data like not empty ✅
  if (
    [fullName, email, username, password].some((field) => field.trim() === "")
  ) {
    throw new ApiError(400, "All fields are required");
  }

  // 3. check if user already exists (check either by username or email) ✅
  const existedUser = await User.findOne({
    $or: [{ username }, { email }],
  });

  console.log("log from userController of existed user:- ", existedUser);

  if (existedUser) {
    throw new ApiError(409, "User with email or username already exists");
  }

  // 4. check for images, check for avatar ✅
  console.log("log of req.files from userController:-", req.files)
  const avatarLocalPath = req.files?.avatar[0]?.path;
  // const coverImageLocalPath = req.files?.coverImage[0]?.path; //this code gives the problem when cover image is empty

  let coverImageLocalPath ;
  if(req.files && Array.isArray(req.files.coverImage) && req.files.coverImage.length > 0) {
    coverImageLocalPath = req.files.coverImage[0].path
  }



  if (!avatarLocalPath) {
    throw new ApiError(400, "Avatar file is required");
  }

  // 5. upload them to cloudinary, check for avatar
  const avatar = await uploadOnCloudinary(avatarLocalPath);
  const coverImage = await uploadOnCloudinary(coverImageLocalPath);

  if (!avatar) {
    throw new ApiError(400, "Avatar file is required");
  }

  // 6. create user object - create entry in db
  const newUser = await User.create({
    fullName,
    avatar: avatar.url,
    coverImage: coverImage?.url || "",
    email,
    password,
    username: username.toLowerCase(),
  });
  
  console.log("log of newUser from userController :-" , newUser)

  // 7. remove user password and refresh token field from response
  const createdUser = await User.findById(newUser._id).select(
    "-password -refreshToken" // does not select these two fields and selects all others
  );

  // 8. check for user creation
  if (!createdUser) {
    throw new ApiError(500, "Something went wrong while registering the user");
  }

  // 9. return response
  return res.status(201).json(
    new ApiResponse(200, createdUser, "User registered successfully")
  );
});


const loginUser = asyncHandler(async (req, res) =>{
  // 1. get the user's credential from the req.body 
  // 2. check the username or email is empty or not
  // 3. find the user
  // 4. check the password
  // 5. access the access and refresh token
  // 6. remove password and refreshToken from the userdata
  // 7. send the cookies 
  // 8. send the response all above operation is success


  // 1. get the user's credential from the req.body 
     const { username, email, password } = req.body

  // 2. check the username or email is empty or not
    if( !username || !email ){
      throw new ApiError(400, "username or email is required")
    }

  // 3. find the user
    const user = await User.findOne({
      $or: [ {username} , {email} ]
    })

    if(!user){
      throw new ApiError("404", "user not found !!!")
    }
 
  // 4. check the password
    const isPasswordValid = await user.isPasswordCorrect(password) 

    if(!isPasswordValid){
      throw new ApiError (401, "Inavalid credentials")
    }

  // 5. access the access and refresh token
   const  {accessToken, refreshToken} = await generateAccessAndRefreshTokens(user._id)


  // 6. remove password and refreshToken from the userdata
    const loggedInUser = await User.findById(user._id).select("-password -refreshToken")

  // 6. send the cookies 
    const  options  = {
      httpOnly: true,
      secure: true
    }

    return res
    .status(200)
    .cookie("accessToken", accessToken , options)
    .cookie("refreshToken", refreshToken, options)
    .json(
      new ApiResponse(200,
        {
          user: loggedInUser, accessToken, refreshToken
        },
        "user logged in Successfully"
      )
    )


  })

const logoutUser = asyncHandler(async(req,res) => {
 await  User.findByIdAndUpdate(
  req.user._id,
  {
    $set: {
      refreshToken: undefined
    }
  },
  {
    new: true
  }
)

// this makes to upadate cookies from database only
const options = {
  httpOnly: true,
  secure: true
}

return res
 .status(200)
 .clearCookie("accessToken", options) 
 .clearCookie("refreshToken", options) 
 .json(new ApiResponse(200,{}, "user Logged out successfully"))




})


export { registerUser , loginUser, logoutUser};
