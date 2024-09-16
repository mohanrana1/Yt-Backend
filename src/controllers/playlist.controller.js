import mongoose, { isValidObjectId } from "mongoose";
import { Playlist } from "../models/playlist.model.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { asyncHandler } from "../utils/asyncHandler.js";

const createPlaylist = asyncHandler(async (req, res) => {
  const { name, description } = req.body;

  //TODO: create playlist

  if (!name || !description) {
    throw new ApiError(400, "name and description are required");
  }

  if (description.length > 20) {
    throw new ApiError(400, "description size is too big");
  }

  const newplaylist = await new Playlist({
    name: name,
    description: description,
  });

  try {
    await newplaylist.save();
  } catch (error) {
    throw new ApiError(500, "something went wrong while creating playlist");
  }

  // return response
  return res
    .status(201)
    .json(
      new ApiResponse(201, newplaylist, "successfully created new Playlist")
    );
});

const getUserPlaylists = asyncHandler(async (req, res) => {
  const { userId } = req.params;
  //TODO: get user playlists

  if (!userId) {
    throw new ApiError(404, "userId is required");
  }

  const existingPlaylists = await Playlist.find({
    owner: userId,
  });

  if (!existingPlaylists || existingPlaylists.length === 0) {
    return res
      .status(404)
      .json(new ApiResponse(400, { playlist: null }, "No playlist available"));
  } else {
    return res
      .status(200)
      .json(
        new ApiResponse(
          200,
          existingPlaylists,
          "successfully fetched user Playlist"
        )
      );
  }
});

const getPlaylistById = asyncHandler(async (req, res) => {
  const { playlistId } = req.params;

  // Validate playlistId
  if (!playlistId) {
    throw new ApiError(400, "Playlist ID is required"); // 400 for bad request
  }

  // Fetch playlist by ID
  const playlistbyid = await Playlist.findById(playlistId); // Directly pass playlistId

  // Check if playlist exists
  if (!playlistbyid) {
    throw new ApiError(404, "Playlist does not exist");
  }

  // Return the playlist
  return res
    .status(200)
    .json(new ApiResponse(200, playlistbyid, "Playlist fetched successfully"));
});

const addVideoToPlaylist = asyncHandler(async (req, res) => {
  const { playlistId, videoId } = req.params;

  if (!playlistId || !videoId) {
    throw new ApiError(400, "PlaylistId and videoId are required");
  }

  //  /add/:videoId/:playlistId
  // Check Playlist Existence
  const playlist = new Playlist.findById(playlistId);

  if (!playlist) {
    throw new ApiError(404, "Playlist not found");
  }

  // Check if Video Already Exists in Playlist
  const existedvideo = playlist.videos.includes(videoId);

  if (existedvideo) {
    return res
      .status(400)
      .json(
        new ApiResponse(
          400,
          existedvideo,
          "Video already existed in the playlist"
        )
      );
  } else {
    playlist.videos.push(videoId);
    await playlist.save();
  }

  // Step 7: Return Success Response
  return res
    .status(200)
    .json(
      new ApiResponse(200, playlist, "Video added to playlist successfully")
    );
});

const removeVideoFromPlaylist = asyncHandler(async (req, res) => {
  const { playlistId, videoId } = req.params;
  // TODO: remove video from playlist

  if (!playlistId || !videoId) {
    throw new ApiError(400, "Playlist and videoId both are required");
  }

  const playlist = await Playlist.findById(playlistId);

  if (!playlist) {
    throw new ApiError(404, "Playlist not found");
  }

  // check if video is present in playlist or not
  const existedvideo = Playlist.videos.includes(videoId);

  if (!existedvideo) {
    throw new ApiError(404, "video  not found in playlist");
  } else {
    playlist.videos = playlist.videos.filter((video) => video.id !== videoId);
    await playlist.save();
    return res
      .status(200)
      .json(new ApiResponse(200, null, "video is deleted successfully"));
  }
});

const deletePlaylist = asyncHandler(async (req, res) => {
  const { playlistId } = req.params;
  // TODO: delete playlist

  if (!playlistId) {
    throw new ApiError(400, "playlist id not found");
  }

  try {
    const deletedPlaylist = await Playlist.findByIdAndDelete(playlistId);

    if (!deletePlaylist) {
        throw new ApiError(404, "Playlist not found");
      }

     return res.status(200).json(new ApiResponse(200,null, "playlist deleted successfully"))

  } catch (error) {
    throw new ApiError(500, "something went wrong while deleting playlist")
  }
});

const updatePlaylist = asyncHandler(async (req, res) => {
  const { playlistId } = req.params;
  const { name, description } = req.body;
  //TODO: update playlist

  if(!playlistId){
    throw new ApiError(400, "playlistid not found")
  }

  if(!name || !description){
    throw new ApiError(400, "name and description both are required")
  }

  // find and update the playlist with name and description given
    const updatedplaylist = await Playlist.findByIdAndUpdate(
        playlistId,
        {
            $set: {
                name: name,
                description: description
             }
        },
        {new: true}
    )


    if(!updatedplaylist){
        throw new ApiError(500,"something went wrong while updating playlist")
    }else{
        return res.status(200).json(new ApiResponse(200,updatePlaylist, "successfully updated the playlist"))
    }
});

export {
  createPlaylist,
  getUserPlaylists,
  getPlaylistById,
  addVideoToPlaylist,
  removeVideoFromPlaylist,
  deletePlaylist,
  updatePlaylist,
};
