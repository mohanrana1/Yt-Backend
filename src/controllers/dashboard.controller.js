import mongoose from "mongoose"
import {Video} from "../models/video.model.js"
import {Subscription} from "../models/subscription.model.js"
import {Like} from "../models/like.model.js"
import {ApiError} from "../utils/ApiError.js"
import {ApiResponse} from "../utils/ApiResponse.js"
import {asyncHandler} from "../utils/asyncHandler.js"

const getChannelStats = asyncHandler(async (req, res) => {
    // TODO: Get the channel stats like total video views, total subscribers, total videos, total likes etc.

    // 1. Extract Channel ID
    // 2. Initialize Statistics Variables
    // 3. Aggregate Video Data

    // 1. Extract Channel ID
        const userId = user._id
        
    // 2. Initialize Statistics Variables
        let totalviews , totalLikes, totalvideos , totalSubscribers

    // 3. Aggregate Video Data
        const stat1 = await Video.aggregate([
            {
                $match: {
                    id: userId
                }
            }, 
            {
                $group: {
                    _id: "$id",
                    totalviews: { $sum: "$views" },
                    totalVideos: { $sum: 1}
                }
            }
           
        ])

        const stat2 = await Like.aggregate([
            {
                $match: {
                    id: userId
                }
            }, 
            {
                $group: {
                    _id: "$id",
                    totalviews: { $sum: "$views" },
                    totalVideos: { $sum: 1}
                }
            }
           
        ])

 
      // 4. Count Subscribers
        totalSubscribers = await Subscription.countDocuments({ _id: userId})  
})

const getChannelVideos = asyncHandler(async (req, res) => {
    // TODO: Get all the videos uploaded by the channel
})

export {
    getChannelStats, 
    getChannelVideos
    }