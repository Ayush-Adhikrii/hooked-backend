import express from "express";
import {
	deleteById,
	findAll,
	findById,
	findByUserId,
	saveDetails,
	update,
} from "../controllers/userDetailsController.js";
import asyncHandler from "../middleware/asyncHandler.js";
import { protectRoute } from "../middleware/auth.js";
const router = express.Router();

// Get all userDetails
router.get("/", protectRoute, asyncHandler(findAll));

// Save a new userDetails
router.post("/", protectRoute, asyncHandler(saveDetails));

// Get a userDetails by ID
router.get("/:id", protectRoute, asyncHandler(findById));

// Get a userDetails by ID
router.get("/user/:id", protectRoute, asyncHandler(findByUserId));

// Update a userDetails by ID
router.put("/:id", protectRoute, asyncHandler(update));

// Delete a userDetails by ID
router.delete("/:id", protectRoute, asyncHandler(deleteById));

export default router;
