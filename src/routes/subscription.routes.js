import { Router } from "express";
import { verifyJWT } from "../middlewares/auth.middleware.js";
import { getSubscribedChannels, getUserChannelSubscribers, toggleSubscription } from "../controllers/subscription.controller.js";

const router = Router();

// Apply verifyJWT middleware to all routes
router.use(verifyJWT);

// Route to get subscribers of a channel (those subscribed to the channel)
router.route("/channel/:channelId/subscribers")
    .get(getUserChannelSubscribers);

// Route to toggle subscription for a user (subscribing or unsubscribing to a channel)
router.route("/channel/:channelId/toggle")
    .post(toggleSubscription);

// Route to get channels that the user is subscribed to
router.route("/u/:subscriberId/subscribed-channels")
    .get(getSubscribedChannels);

export default router;
