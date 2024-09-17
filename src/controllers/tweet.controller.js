import mongoose, { isValidObjectId } from "mongoose"
import {Tweet} from "../models/tweet.model.js"
import {User} from "../models/user.model.js"
import {ApiError} from "../utils/ApiError.js"
import {ApiResponse} from "../utils/ApiResponse.js"
import {asyncHandler} from "../utils/asyncHandler.js"

// router.route("/").post(createTweet);
const createTweet = asyncHandler(async (req, res) => {
    // Extracting userId from the request user object
    const userId = req.user._id;
    const { content } = req.body;

    // Check if content is provided and not empty
    if (!content || content.trim().length === 0) {
        throw new ApiError(400, "Content is required");
    }

    // Optional: Add content length validation
    if (content.length > 280) {  // Example for Twitter-like length limitation
        throw new ApiError(400, "Content exceeds the maximum length of 280 characters");
    }

    // Creating the new tweet
    const newTweet = await Tweet.create({
        content: content,
        owner: userId
    });

    // If you just want to create and immediately save a document, use Tweet.create() (the first example).
    // If you want to create the document and modify it or perform additional operations before saving, use new Tweet() followed by .save() (the second example).
    // const newTweet = await new Tweet({
    //     content: content,
    //     owner: userId
    // })

    if (!newTweet) {
        throw new ApiError(500, "Something went wrong while creating the tweet");
    }

    // Return a successful response
    return res.status(201).json(new ApiResponse(201, newTweet, "Successfully created new Tweet"));
});

// router.route("/user/:userId").get(getUserTweets);
const getUserTweets = asyncHandler(async (req, res) => {
    // Extract userId from route parameters
    const { userId } = req.params;

    // Validate the userId
    if (!isValidObjectId(userId)) {
        throw new ApiError(400, "UserId is not valid");
    }

    try {
        // Fetch user tweets based on the userId
        const userTweets = await Tweet.find({ owner: userId });

        // Check if user has tweets
        if (!userTweets || userTweets.length === 0) {
            return res.status(200).json(new ApiResponse(200, { Tweets: 0 }, "No tweets found"));
        }

        // Return the found tweets
        return res.status(200).json(new ApiResponse(200, userTweets, "Successfully fetched user tweets"));
    } catch (error) {
        throw new ApiError(500, "Something went wrong while fetching tweets");
    }
});

// router.route("/:tweetId").patch(updateTweet)
const updateTweet = asyncHandler(async (req, res) => {
    // Get tweetId and content from request
    const tweetId = req.params.tweetId;
    const { content } = req.body;

    // Validate tweetId
    if (!isValidObjectId(tweetId)) {
        throw new ApiError(400, "Invalid tweetId");
    }

    if(!content || content.trim().length === 0){
        throw new ApiError(400, "content is required")
    }

    if(content.length > 280){
        throw new ApiError(400, "content size is too large")
    }

    try {
        // Find and update the tweet by tweetId
        const tweet = await Tweet.findByIdAndUpdate(
            tweetId,
            { content },
            { new: true } // Return the updated document
        );

        // Check if the tweet was found and updated
        if (!tweet) {
            throw new ApiError(404, "Tweet not found");
        }

        // Respond with updated tweet
        return res.status(200)
            .json(new ApiResponse(200, tweet, "Tweet updated successfully"));
    } catch (error) {
        // Handle errors
        throw new ApiError(500, "Something went wrong while updating tweet");
    }
});

// router.route("/:tweetId").delete(deleteTweet)
const deleteTweet = asyncHandler(async (req, res) => {
    //TODO: delete tweet

    const tweetId = req.params.tweetId;

    if (!isValidObjectId(tweetId)) {
        throw new ApiError(400, "Invalid tweetId");
    }

    try {
        // Find and delete the tweet by tweetId
        const tweet = await Tweet.findByIdAndDelete(tweetId);

        // Check if the tweet was found and deleted
        if (!tweet) {
            throw new ApiError(404, "Tweet not found");
        }

        
        return res.status(200)
            .json(new ApiResponse(200, tweet, "Tweet id deleted successfully"));
    } catch (error) {
        // Handle errors
        throw new ApiError(500, "Something went wrong while deleting tweet");
    }

})

export {
    createTweet,
    getUserTweets,
    updateTweet,
    deleteTweet
}