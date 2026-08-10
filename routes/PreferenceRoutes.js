import express from "express";
import {
	deleteById,
	findAll,
	findPreferenceByUserId,
	save,
	updatePreferenceByUserId,
} from "../controllers/PreferenceController.js";
import asyncHandler from "../middleware/asyncHandler.js";
import { protectRoute } from "../middleware/auth.js";
const router = express.Router();

router.post("/", protectRoute, asyncHandler(save));
router.get("/", protectRoute, asyncHandler(findAll));
router.get("/:id", protectRoute, asyncHandler(findPreferenceByUserId));
router.delete("/:id", protectRoute, asyncHandler(deleteById));
router.put("/:id", protectRoute, asyncHandler(updatePreferenceByUserId));

export default router;
