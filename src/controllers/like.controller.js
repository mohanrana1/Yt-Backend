import mongoose, { isValidObjectId } from "mongoose";
import { Like } from "../models/like.model.js";
import { Video } from "../models/video.model.js"; // Assuming there's a video model
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { asyncHandler } from "../utils/asyncHandler.js";

// Toggle Like on a Video
const toggleVideoLike = asyncHandler(async (req, res) => {
    const { videoId } = req.params;
    const userId = req.user._id;

    if (!isValidObjectId(videoId)) {
        return res.status(400).json(new ApiError(400, "Invalid video ID"));
    }

    const existingLike = await Like.findOne({ video: videoId, likedBy: userId });

    if (existingLike) {
        await Like.deleteOne({ _id: existingLike._id });
        return res.status(200).json(new ApiResponse(200, { liked: false }, "Video unliked"));
    } else {
        const newLike = new Like({
            video: videoId,
            likedBy: userId
        });
        await newLike.save();
        return res.status(201).json(new ApiResponse(201, { liked: true }, "Video liked successfully"));
    }
});

// Toggle Like on a Comment
const toggleCommentLike = asyncHandler(async (req, res) => {
    const { commentId } = req.params;
    const userId = req.user._id;

    if (!isValidObjectId(commentId)) {
        return res.status(400).json(new ApiError(400, "Invalid comment ID"));
    }

    const existingLike = await Like.findOne({ comment: commentId, likedBy: userId });

    if (existingLike) {
        await Like.deleteOne({ _id: existingLike._id });
        return res.status(200).json(new ApiResponse(200, { liked: false }, "Comment unliked successfully"));
    } else {
        const newLike = new Like({
            comment: commentId,
            likedBy: userId
        });
        await newLike.save();
        return res.status(201).json(new ApiResponse(201, newLike, "New comment like created successfully"));
    }
});

// Toggle Like on a Tweet
const toggleTweetLike = asyncHandler(async (req, res) => {
    const { tweetId } = req.params;
    const userId = req.user._id;

    if (!isValidObjectId(tweetId)) {
        return res.status(400).json(new ApiError(400, "Invalid tweet ID"));
    }

    const existingLike = await Like.findOne({ tweet: tweetId, likedBy: userId });

    if (existingLike) {
        await Like.deleteOne({ _id: existingLike._id });
        return res.status(200).json(new ApiResponse(200, { liked: false }, "Tweet unliked successfully"));
    } else {
        const newLike = new Like({
            tweet: tweetId,
            likedBy: userId
        });
        await newLike.save();
        return res.status(201).json(new ApiResponse(201, newLike, "New tweet like created successfully"));
    }
});

// Get All Liked Videos
const getLikedVideos = asyncHandler(async (req, res) => {
    const userId = req.user._id;

    const videos = await Like.find({
        likedBy: userId,
        video: { $exists: true } // Ensures only video likes are retrieved
    }).populate("video");

    return res.status(200).json(new ApiResponse(200, { likedVideos: videos.map(like => like.video) }, "Successfully retrieved liked videos"));
});

export {
    toggleCommentLike,
    toggleTweetLike,
    toggleVideoLike,
    getLikedVideos
};
