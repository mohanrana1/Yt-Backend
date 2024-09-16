import { Router } from "express";
import {addComment, deleteComment, getVideoComments, updateComment} from "../controller/comment.controller.js"
import { upload } from "../middlewares/multer.middleware.js";
import { verifyJWT } from "../middlewares/auth.middleware.js";

const router = Router();

// http://localhost:8000/api/v1/comments/

router.use(verifyJWT) // apply verifyJWT middleware to all routes in this file

router.route("/:videoId").get(getVideoComments).post(addComment);
router.route("/comment/:commentId").delete(deleteComment).patch(updateComment);

export default router