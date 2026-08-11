import express from "express";
import { deleteById, findAll, findDetail, saveDetails, updateDetail } from "../controllers/userDetailsController.js";
import asyncHandler from "../middleware/asyncHandler.js";
import { protectRoute } from "../middleware/auth.js";
const router = express.Router();

// Get all userDetails
router.get("/", protectRoute, asyncHandler(findAll));

// Save a new userDetails
router.post("/", protectRoute, asyncHandler(saveDetails));

// Delete a userDetails by ID
router.delete("/:id", protectRoute, asyncHandler(deleteById));

router.get("/getDetail", protectRoute, asyncHandler(findDetail));
router.put("/", protectRoute, asyncHandler(updateDetail));

export default router;
