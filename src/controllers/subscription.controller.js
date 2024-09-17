import mongoose, {isValidObjectId} from "mongoose"
import {User} from "../models/user.model.js"
import { Subscription } from "../models/subscription.model.js"
import {ApiError} from "../utils/ApiError.js"
import {ApiResponse} from "../utils/ApiResponse.js"
import {asyncHandler} from "../utils/asyncHandler.js"



// router.route("/channel/:channelId/toggle").post(toggleSubscription)
const toggleSubscription = asyncHandler(async (req, res) => {
    const { channelId } = req.params;
    const userId = req.user._id;
  
    if (!channelId  || !isValidObjectId(channelId)) {
      throw new ApiError(400, "channelId not found");
    }
  
    // Check if the user is already subscribed
    const existingSub = await Subscription.findOne({
      subscriber: userId,
      channel: channelId
    });
  
    if (existingSub) {
      // If a subscription exists, delete it (unsubscribe)
      await Subscription.findOneAndDelete({
        subscriber: userId,
        channel: channelId
      });
      return res
        .status(200)
        .json(new ApiResponse(200, null, "Unsubscribed from the channel successfully"));
    } else {
      // If no subscription exists, create a new one (subscribe)
      const newSub = new Subscription({
        subscriber: userId,
        channel: channelId
      });
      await newSub.save();
      return res
        .status(200)
        .json(new ApiResponse(200, newSub, "Channel subscribed successfully"));
    }
  });
  

// controller to return subscriber list of a channel
// router.route("/channel/:channelId/subscribers").get(getUserChannelSubscribers);
const getUserChannelSubscribers = asyncHandler(async (req, res) => {
  const { channelId } = req.params;

  // Validate if channelId is present and valid
  if (!channelId || !isValidObjectId(channelId)) {
    throw new ApiError(400, "Invalid or missing channelId");
  }

  try {
    // Find subscribers of the channel
    const subscribersOFchannel = await Subscription.find({ channel: channelId });

    // If no subscribers are found, return a count of 0
    if (!subscribersOFchannel || subscribersOFchannel.length === 0) {
      return res.status(200).json(new ApiResponse(200, { subscribercount: 0 }, "No subscriber is found"));
    }

    // Return the count of subscribers if found
    return res.status(200).json(new ApiResponse(200, { subscribercount: subscribersOFchannel.length }, "Subscribers fetched successfully"));
  } catch (error) {
    throw new ApiError(500, "Error while fetching subscribers of the channel");
  }
});


// controller to return channel list to which user has subscribed
const getSubscribedChannels = asyncHandler(async (req, res) => {
    const { subscriberId } = req.params

    if (!subscriberId || !isValidObjectId(subscriberId)) {
      throw new ApiError(400, "Invalid or missing subscriberId");
    }

   try {
    // findById is used when querying by the document's _id, but in this case, you're querying by subscriber, so you should use find() instead.
     const subscribedChannel = await Subscription.find({subscriber: subscriberId})
 
     if(!subscribedChannel || subscribedChannel.length === 0 ){
      return res.status(200).json(new ApiResponse(200, { subscribedTO: 0 }, "No subscribed channel found"));
     }

     return res.status(200).json(new ApiResponse(200, subscribedChannel, "successfully fetched the subscribed channle"));


   } catch (error) {
    throw new ApiError(500, "Something went wrong while fetching subscribed channel")
   }
})

export {
    toggleSubscription,
    getUserChannelSubscribers,
    getSubscribedChannels
}