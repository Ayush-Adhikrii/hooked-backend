import express from "express";
import {
	getLikers,
	getMatches,
	getUserProfiles,
	superLike,
	swipeLeft,
	swipeRight,
} from "../controllers/matchController.js";
import asyncHandler from "../middleware/asyncHandler.js";
import { protectRoute } from "../middleware/auth.js";

const router = express.Router();

router.post("/swipe-right/:likedUserId", protectRoute, asyncHandler(swipeRight));
router.post("/swipe-left/:dislikedUserId", protectRoute, asyncHandler(swipeLeft));
router.post("/super-like/:likedUserId", protectRoute, asyncHandler(superLike));

router.get("/", protectRoute, asyncHandler(getMatches));
router.get("/user-profiles", protectRoute, asyncHandler(getUserProfiles));
router.get("/likers/:userId", protectRoute, asyncHandler(getLikers));

export default router;
