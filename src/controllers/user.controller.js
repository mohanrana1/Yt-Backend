import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiError } from "../utils/ApiError.js";
import { User } from "../models/user.model.js";
import { uploadOnCloudinary } from "../utils/cloudinary.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import jwt from "jsonwebtoken";
import { deleteFromCloudinary } from "../utils/deleteImage.js";

function extractPublicIdFromUrl(url) {
  if (!url) return null;
  
  // Regex to extract the publicId from a Cloudinary URL
  const regex = /\/([^\/]+)\.[a-zA-Z0-9]+$/;
  const match = url.match(regex);
  
  return match ? match[1] : null;
}



const generateAccessAndRefreshTokens = async (userId) => {
  try {
    // Fetch the user from the database by ID
    const existedUser = await User.findById(userId);

    // Check if user exists
    if (!existedUser) {
      throw new ApiError(404, "User not found");
    }

    // Generate access and refresh tokens
    const accessToken = existedUser.generateAccessToken(); // Assuming these are instance methods
    const refreshToken = existedUser.generateRefreshToken();

    // Assign the refresh token to the user and save the user document
    existedUser.refreshToken = refreshToken;
    await existedUser.save({ validateBeforeSave: false });

    // Return the generated tokens
    return { accessToken, refreshToken };
  } catch (error) {
    console.error("Error in token generation: ", error);
    throw new ApiError(
      500,
      "something went wrong while generating refresh and access token"
    );
  }
};

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
  console.log("NEW LOG STARTS FROM HERE: -");
  console.log("req.body from userController is:", req.body);

  const { fullName, email, username, password } = req.body;

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
  console.log("log of req.files from userController:-", req.files);
  const avatarLocalPath = req.files?.avatar[0]?.path;
  // const coverImageLocalPath = req.files?.coverImage[0]?.path; //this code gives the problem when cover image is empty

  let coverImageLocalPath;
  if (
    req.files &&
    Array.isArray(req.files.coverImage) &&
    req.files.coverImage.length > 0
  ) {
    coverImageLocalPath = req.files.coverImage[0].path;
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

  console.log("log of newUser from userController :-", newUser);

  // 7. remove user password and refresh token field from response
  const createdUser = await User.findById(newUser._id).select(
    "-password -refreshToken" // does not select these two fields and selects all others
  );

  // 8. check for user creation
  if (!createdUser) {
    throw new ApiError(500, "Something went wrong while registering the user");
  }

  // 9. return response
  return res
    .status(201)
    .json(new ApiResponse(200, createdUser, "User registered successfully"));
});

const loginUser = asyncHandler(async (req, res) => {
  // 1. get the user's credential from the req.body
  // 2. check the username or email is empty or not
  // 3. find the user
  // 4. check the password
  // 5. access the access and refresh token
  // 6. remove password and refreshToken from the userdata
  // 7. send the cookies
  // 8. send the response all above operation is success

  // 1. get the user's credential from the req.body
  const { username, email, password } = req.body;

  // 2. check the username or email is empty or not
  if (!(username || email)) {
    throw new ApiError(400, "username or email is required");
  }

  // 3. find the user
  const user = await User.findOne({
    $or: [{ username }, { email }],
  });

  if (!user) {
    throw new ApiError("404", "user not found !!!");
  }

  // 4. check the password
  const isPasswordValid = await user.isPasswordCorrect(password);

  if (!isPasswordValid) {
    throw new ApiError(401, "Inavalid credentials");
  }

  // 5. access the access and refresh token
  const { accessToken, refreshToken } = await generateAccessAndRefreshTokens(
    user._id
  );

  // 6. remove password and refreshToken from the userdata
  const loggedInUser = await User.findById(user._id).select(
    "-password -refreshToken"
  );

  // 6. send the cookies
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
          accessToken,
          refreshToken,
        },
        "user logged in Successfully"
      )
    );
});

const logoutUser = asyncHandler(async (req, res) => {
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

  // this makes to upadate cookies from database only
  const options = {
    httpOnly: true,
    secure: true,
  };

  return res
    .status(200)
    .clearCookie("accessToken", options)
    .clearCookie("refreshToken", options)
    .json(new ApiResponse(200, {}, "user Logged out successfully"));
});

const refreshAccessToken = asyncHandler(async (req, res) => {
  const incomingRefreshToken = req.cokies.refreshToken || req.body.refreshToken; // this is the token of user's cookies

  if (!incomingRefreshToken) {
    throw new ApiError(401, "unauthorized request");
  }

  try {
    const decodedToken = jwt.verify(
      incomingRefreshToken,
      process.env.ReFRESH_TOKEN_SECRET
    );

    const user = await User.findById(decodedToken?._id);

    if (!user) {
      throw new ApiError(401, "Invalid refresh token");
    }

    if (incomingRefreshToken !== user?.refreshToken) {
      throw new ApiError(401, "refresh token is expired or used");
    }

    const options = {
      httpOnly: true,
      secure: true,
    };

    const { accessToken, newRefreshToken } =
      await generateAccessAndRefreshTokens(user._id);

    return res
      .status(200)
      .cookie("accessToken", accessToken, options)
      .cookie("refreshToken", newRefreshToken, options)
      .json(
        new ApiResponse(
          200,
          { accessToken, refreshToken: newRefreshToken },
          "Access Token refreshed"
        )
      );
  } catch (error) {
    if (error) {
      throw new ApiError(401, error?.message || "Invalid refresh Token");
    }
  }
});

const changeCurrentPassword = asyncHandler(async (req, res) => {
  const { oldPassword, newPassword } = req.body;

  const user = await User.findById(req.user?._id); // req.user taken from authmiddleware line no 25

  const isPasswordCorrect = await user.isPasswordCorrect(oldPassword);

  if (!isPasswordCorrect) {
    throw new ApiError(400, "Invalid old password");
  }

  user.password = newPassword;
  await user.save({ validateBeforeSave: false });

  return res
    .status(200)
    .json(new ApiResponse(200, {}, "Password changed successfully"));
});

const getCurrentUser = asyncHandler(async (req, res) => {
  return res
    .status(200)
    .json(new ApiResponse(200, req.user, "current user fetced successfully"));
});

const updateAccountDetails = asyncHandler(async (req, res) => {
  const { fullName, email } = req.body;

  if (!fullName || !email) {
    throw new ApiError(400, "All fields are required");
  }

  const user = await User.findByIdAndUpdate(
    req.body?._id,
    {
      $set: {
        fullName, // fullName: fullName is written simply as fullName in ES6 version of js
        email,
      },
    },
    { new: true }
  ).select("-password");

  return res
    .status(200)
    .json(new ApiResponse(200, user, "Account details updated successfully"));
});

const updateUserAvatar = asyncHandler(async (req, res) => {
  const avatarLocalPath = req.file?.path;

  if (!avatarLocalPath) {
    throw new ApiError(400, "Avatar file is missing");
  }

  //TODO: delete old image - assignment
  const oldAvatarUrl = req.user?.avatar;
  const oldPublicId = extractPublicIdFromUrl(oldAvatarUrl);
  if (oldPublicId) {
    await deleteFromCloudinary(oldPublicId);
  }

   
  // upload new avatar
  // here avatar is object
  const avatar = await uploadOnCloudinary(avatarLocalPath);

  if (!avatar.url) {
    throw new ApiError(400, "Error while uploading avatar");
  }

  const user = await User.findByIdAndUpdate(
    req.user._id,
    {
      $set: {
        avatar: avatar.url,
      },
    },
    { new: true }
  ).select("-password");

  return res
  .status(200)
  .json(new ApiResponse(200, user, "Avatar is updated successfully"));

  
});

const updateUserCoverImage = asyncHandler(async (req, res) => {
  const CoverImageLocalPath = req.file?.path;

  if (!CoverImageLocalPath) {
    throw new ApiError(400, "Cover Image file is missing");
  }

  // here coverImage is object
  const coverImage = await uploadOnCloudinary(coverImageLocalPath);

  if (!coverImage.url) {
    throw new ApiError(400, "Error while uploading coverImage");
  }

  const user = await User.findByIdAndUpdate(
    req.user._id,
    {
      $set: {
        coverImage: coverImage.url,
      },
    },
    { new: true }
  ).select("-password");

  return res.status(200).json(200, user, "coverImage is updated successfully");

  
});

const getUserChannelProfile = asyncHandler(async(req,res)=>{
  const {username} = req.params

  if(!username?.trim()){
    throw new ApiError(400, "username is missing")
  }

  const channel = await User.aggregate([ // When you call User.aggregate([...]), you are running an aggregation pipeline on the User collection.
    //first stage 
    {
      $match: {
        username: username?.toLowerCase()
      }
    },
    //second stage which will perform some operation on result of first stage
    {
      //The $lookup stage takes several parameters to define the join:
      // from: The name of the collection you want to join with the current collection.
      // localField: The field in the current collection that corresponds to the foreign key in the from collection.
      // foreignField: The field in the from collection that corresponds to the local key.
      // as: The name of the new array field that will hold the joined documents.
      $lookup: { // to get no of subscriber
        from: "subscriptions",
        localField: "_id",
        foreignField: "channel",
        as: "subscribers" // this subscribers will be the new field
      }
    },
    {
      lookup: { // to get to how much channel is subscriber by this user/channel
        from: "subscriptions",
        localField: "_id",
        foreignField: "subscriber",
        as: "subscribedTo"
      }
    },
    {
      $addFields: {
        subscribersCount: {
          $size: "$subscribers"
        },
        channelSubscribedToCount: {
          $size: "$subscribedTo"
        },
        isSubscribed: {
          $cond: {
            if: {$in: [req.user?._id, $subscribers.subscriber]},
            then: true,
            else: false
          }
        }
      }
    },
    {
      $project: {
        fullName: 1,
        username: 1,
        subscribersCount: 1,
        channelSubscribedToCount: 1,
        isSubscribed: 1,
        avatar: 1,
        coverImage: 1,
        email: 1
      }
    }
  ])

  if(!channel?.length){
    throw new ApiError(404, "channel does not exist")
  }

  console.log(channel)

  return res
  .status(200)
  .json(
    new ApiResponse(200, channel[0], "user channel fetched sucessfully" )
  )
  
})

export {
  registerUser,
  loginUser,
  logoutUser,
  refreshAccessToken,
  changeCurrentPassword,
  getCurrentUser,
  updateAccountDetails,
  updateUserAvatar,
  updateUserCoverImage
};
