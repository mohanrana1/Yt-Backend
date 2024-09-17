import mongoose, {isValidObjectId} from "mongoose"
import {Video} from "../models/video.model.js"
import {User} from "../models/user.model.js"
import {ApiError} from "../utils/ApiError.js"
import {ApiResponse} from "../utils/ApiResponse.js"
import {asyncHandler} from "../utils/asyncHandler.js"
import {uploadOnCloudinary, deleteFromCloudinary} from "../utils/cloudinary.js"
import { calculateVideoDuration } from "../utils/calculateVideoDuration.js"

// router.route("/").get(getAllVideos)
const getAllVideos = asyncHandler(async (req, res) => {
    let { page = 1, limit = 10, query, sortBy, sortType, userId } = req.query
    //TODO: get all videos based on query, sort, pagination

    // 1. validate queries of the user
    if(!query || query.trim().length === 0){
        throw new ApiError(400, "Query text can't be empty")
    }
    
    if(!sortBy || sortBy.trim().length === 0 ){
        throw new ApiError(400, "sortBy can't be empty")
    }

    if(!sortType || sortType.trim().length === 0 ){
        throw new ApiError(400, "sortType can't be empty")
    }

    if(query.trim().length > 50){
        throw new ApiError(400, "Query text is too large")
    }

    

    // 2. pagination and limiting 
         page = parseInt(page)
         limit = parseInt(limit)

         if(limit>50){
            throw new ApiError(400, "limit is too big it can reduce performance")
        }

        const skip = (page - 1) * limit

    // 3. filter the video according to the query given
        const filteredVideos = await Video.find({
            $or: [
                { title: { $regex: query.trim(), $options: "i" } }, // Case-insensitive search in title
                { description: { $regex: query.trim(), $options: "i" } } // Case-insensitive search in description
            ]
        }).skip(skip)
          .limit(limit)
          .sort({ [sortBy]: sortType === 'asc' ? 1 : -1})
          // let's assume the user queries sortBy = publishedDate , sortType=desc 
          // in this case [sortBy] becomes "publishedDate", so the query becomes { publishedDate: -1 }.
          // Since the sortType is 'desc', it will sort the videos in descending order of the publishedDate field.


    // 4. send response
    return res.status(200)
    .json(new ApiResponse(200, filteredVideos, "Successfully fetched the videos"))      
})


// router.route("/")
//     .post(
//         upload.fields([
//             {
//                 name: "videoFile",
//                 maxCount: 1,
//             },
//             {
//                 name: "thumbnail",
//                 maxCount: 1,
//             },
            
//         ]),
//         publishAVideo
//     );
const publishAVideo = asyncHandler(async (req, res) => {
    const { title, description } = req.body;
    const userId = req.user._id;

    // Get video and thumbnail from req.files
    const videoFile = req.files?.video?.[0]?.path;
    const thumbnailFile = req.files?.thumbnail?.[0]?.path;

    // Validation
    if (!videoFile) {
        throw new ApiError(400, "Video is required");
    }
    if (!title || title.trim().length === 0) {
        throw new ApiError(400, "Title is required");
    }
    if (!description || description.trim().length === 0) {
        throw new ApiError(400, "Description is required");
    }
    if (title.trim().length > 50) {
        throw new ApiError(400, "Title is too long (max 50 characters)");
    }
    if (description.trim().length > 280) {
        throw new ApiError(400, "Description is too long (max 280 characters)");
    }

    // Upload to Cloudinary
    const video = await uploadOnCloudinary(videoFile);
    const thumbnail = await uploadOnCloudinary(thumbnailFile);

    // Check if video and thumbnail were uploaded successfully
    if (!video) {
        throw new ApiError(500, "Failed to upload video to Cloudinary");
    }
    if (!thumbnail) {
        throw new ApiError(500, "Failed to upload thumbnail to Cloudinary");
    }

    // Calculate video duration
    const videoDuration = await calculateVideoDuration(video.url);

    // Create a new video in the database
    const newVideo = await Video.create({
        videoFile: video.url,
        thumbnail: thumbnail.url,
        title: title.trim(),
        description: description.trim(),
        duration: videoDuration,
        views: 0, // New videos should start with 0 views
        isPublished: false, // Video is saved as draft
        owner: userId
    });

    if (!newVideo) {
        throw new ApiError(500, "Something went wrong while creating the video");
    }

    // Respond with the newly created video
    res.status(200).json(new ApiResponse(200, newVideo, "Successfully uploaded a video"));
});


// router.route("/:videoId").get(getVideoById)
const getVideoById = asyncHandler(async (req, res) => {
    const { videoId } = req.params;

    // Validate videoId
    if (!isValidObjectId(videoId)) {
        throw new ApiError(400, "VideoId is invalid");
    }

    if (!videoId) {
        throw new ApiError(400, "videoId can't be empty");
    }

    // Fetch video by ID
    const video = await Video.findById(videoId); // Use videoId directly

    // Check if video exists
    if (!video) {
        throw new ApiError(404, "Video not found");
    }

    // Respond with the video data
    res.status(200).json(new ApiResponse(200, video, "Successfully fetched the video"));
});


// router.route("/:videoId").patch(upload.single("thumbnail"), updateVideo);
const updateVideo = asyncHandler(async (req, res) => {
    const { videoId } = req.params
    //TODO: update video details like title, description, thumbnail
    
    const {title, description} = req.body
    const thumbnailLocalFilePath = req.files?.thumbnail[0]?.path

    //validate
    if (!isValidObjectId(videoId)) {
        throw new ApiError(400, "VideoId is invalid");
    }

    if(!title || title.trim().length === 0){
        throw new ApiError(400, "Title can't be empty")
    }
    if(title.trim().length > 50){
        throw new ApiError(400, "Title is too long")
    }


    if(!description || description.trim().length === 0){
        throw new ApiError(400, "description can't be empty")
    }
    if(description.trim().length > 280){
        throw new ApiError(400, "description is too long")
    }

    //upload the new thumbnail to cloudinary
    if (thumbnailLocalFilePath) {
        const updatedThumbnail = await uploadOnCloudinary(thumbnailLocalFilePath);
        if (!updatedThumbnail) {
            throw new ApiError(500, "Failed to upload thumbnail to Cloudinary");
        }
    }



    // Find and update the video
    const updateData = {
        title: title.trim(),
        description: description.trim(),
    };

    // If there's a new thumbnail, add it to the update data
    if (updatedThumbnailUrl) {
        updateData.thumbnail = updatedThumbnailUrl;
    }


    //find and update the video
        const video = await Video.findByIdAndUpdate(
            videoId,
            { $set:  updateData },
            {new: true}
        )

        if(!video){
            throw new ApiError(500, "Couldn't update the video")
        }

        return res.status(200)
        .json(new ApiResponse(200, video, "successfully updated the video"))


})



const deleteVideo = asyncHandler(async (req, res) => {
    const { videoId } = req.params;

    // Validate videoId
    if (!isValidObjectId(videoId)) {
        throw new ApiError(400, "VideoId is invalid");
    }

    // Find the video by ID
    const video = await Video.findById(videoId);

    if (!video) {
        throw new ApiError(404, "Video not found");
    }

    // Delete video from Cloudinary
    const deleteVideoFromCloudinary = await deleteFromCloudinary(video.videoFile);
    const deleteThumbnailFromCloudinary = await deleteFromCloudinary(video.thumbnail);

    if (!deleteVideoFromCloudinary || !deleteThumbnailFromCloudinary) {
        throw new ApiError(500, "Error deleting media from Cloudinary");
    }

    // Delete video from database
    await Video.findByIdAndDelete(videoId);

    return res.status(200).json(new ApiResponse(200, null, "Video deleted successfully"));
});


const togglePublishStatus = asyncHandler(async (req, res) => {
    const { videoId } = req.params;

    // Validate videoId
    if (!isValidObjectId(videoId)) {
        throw new ApiError(400, "VideoId is invalid");
    }

    // Find the video
    const video = await Video.findById(videoId);

    if (!video) {
        throw new ApiError(404, "Video not found");
    }

    // Toggle the published status
    video.published = !video.published;

    // Save the updated video
    await video.save();

    return res.status(200).json(new ApiResponse(200, video, `Video publish status toggled to ${video.published ? "published" : "unpublished"}`));
});


export {
    getAllVideos,
    publishAVideo,
    getVideoById,
    updateVideo,
    deleteVideo,
    togglePublishStatus
}