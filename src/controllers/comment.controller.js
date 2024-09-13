import mongoose from "mongoose";
import { Comment } from "../models/comment.model.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { asyncHandler } from "../utils/asyncHandler.js";

const getvideoComments = asyncHandler(async (req, res) => {
  // TODO: get all comments for a video
  // 1. Extract Parameters and query parameters
  // 2. Convert page and limit to Numbers
  // 3. Calculate skip Value
  // 4. Fetch Comments from the Database:
  // 5. totalno of comments
  // 6. send response

  // 1. Extract Parameters and query parameters
  const { videoId } = req.params;
  let { page = 1, limit = 10 } = req.query;

  // 2. Convert page and limit to Numbers
  page = parseInt(page);
  limit = parseInt(limit);

  // 3. Calculate skip Value
  const skip = (page - 1) * limit;

  // 4. Fetch Comments from the Database
  const comments = await Comment.find({ video: videoId })
    .skip(skip)
    .limit(limit)
    .exec();

  // 5. totalno of comments
  const totalComments = await Comment.countDocuments({ video: videoId });

  // 6. send response
  return res
    .status(200)
    .json(
      new ApiResponse(
        200,
        { comments, totalComments },
        "fetched the video's comment successfully"
      )
    );
});

const addComment = asyncHandler(async (req, res) => {
  // TODO: add a comment to a video
  // 1. Extract Video ID and Comment Data
  // 2. Validate Input
  // 3. Check if the Video Exists
  // 4.  Create a New Comment
  // 5.  Save the Comment to the Database
  // 6. Update the Video Document (Optional)
  // 7. Send Response

  // 1. Extract Video ID and Comment Data
  const { videoId } = req.params;
  const { cmtdata } = req.body;
  const userId = req.user._id

  // 2. Validate Input
  if (!mongoose.Types.ObjectId.isValid(videoId)) {
    throw new ApiError(400, "Invalid video ID");
}

  // Check if the video exists in the Video collection
  const video = await Video.findById(videoId);

  if (!video) {
    throw new ApiError(404, "Video not found");
  }

  // Validate the comment content
  if (!cmtdata || !cmtdata.trim()) {
    throw new ApiError(400, "Comment content is required");
  }

    // 4.  Create a New Comment
     const newComment = new Comment({
        video: videoId,
        user: userId,
        content: content.trim(),
             })

     // 5. Save the Comment to the Database
     await newComment.save();      
     
      // 7. Send Response
    return res.status(201).json(
        new ApiResponse(201, newComment, "Comment added successfully")
    );
});

const updateComment = asyncHandler(async (req, res) => {
  // 1. Extract Comment ID and content from the request
  const { commentId } = req.params;
  const { content } = req.body;

  // 2. Validate Comment ID
  if (!mongoose.Types.ObjectId.isValid(commentId)) {
      throw new ApiError(400, "Invalid comment ID");
  }

  // 3. Validate content
  if (!content || !content.trim()) {
      throw new ApiError(400, "Comment content is required");
  }

  // 4. Find the comment by ID and update it
  const comment = await Comment.findByIdAndUpdate(
      commentId,
      { content: content.trim() },
      { new: true }
  );

  // 5. Check if the comment was found and updated
  if (!comment) {
      throw new ApiError(404, "Comment not found");
  }

  // 6. Return response with the updated comment
  return res
      .status(200)
      .json(new ApiResponse(200, comment, "Comment updated successfully"));
});

const deleteComment = asyncHandler(async (req, res) => {
  // TODO: delete a comment

  // 1. get the commentId from the params
      const {commentId} = req.params

  // 2. find amd update the comment by comment id  
    const comment = await Comment.findByIdAndDelete(commentId)   //findByIdandDelete return the delted document if comment was present otherwise null
    

    if(!comment){
      throw new ApiError(404, "comment is not found")
    }

    // 3. return response
      return res
      .status(200)
      .json(new ApiResponse(200,comment,"comment deleted successfully"))


})

export {
  getvideoComments,
  addComment,
  updateComment,
  deleteComment
  }