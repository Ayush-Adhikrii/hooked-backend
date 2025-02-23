import express from "express";
import { getMatches, getUserProfiles, swipeLeft, getLikers, swipeRight } from "../controllers/matchController.js";
import { protectRoute } from "../middleware/auth.js";

const router = express.Router();

router.post("/swipe-right/:likedUserId", protectRoute, swipeRight);
router.post("/swipe-left/:dislikedUserId", protectRoute, swipeLeft);

router.get("/", protectRoute, getMatches);
router.get("/user-profiles", protectRoute, getUserProfiles);
router.get("/likers/:userId",  getLikers);

export default router;
