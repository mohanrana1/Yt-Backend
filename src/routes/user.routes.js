import { Router } from "express";
import { registerUser } from "../controllers/user.controller.js";
import { upload } from "../middlewares/multer.middleware.js"
import { loginUser, logoutUser } from "../controllers/user.controller";

const router = Router()

router.route('/register').post(
    upload.fields([
        {
            name: "avatar",
            maxXount: 1
        },
        {
            name: "coverImage",
            maxCount: 1
        }
    ]),
    registerUser
)

router.route("/login").post(loginUser)

//secured routes
router.route("/logout").post(logoutUser)

export default router