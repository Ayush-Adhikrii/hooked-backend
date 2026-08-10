import express from "express";
const router = express.Router();

import { deleteById, findAll, findById, save, update } from "../controllers/SubscriptionController.js";
import asyncHandler from "../middleware/asyncHandler.js";
import { protectRoute } from "../middleware/auth.js";

router.get("/", protectRoute, asyncHandler(findAll));
router.post("/", protectRoute, asyncHandler(save));
router.get("/:userId", protectRoute, asyncHandler(findById));
router.delete("/:id", protectRoute, asyncHandler(deleteById));
router.put("/:id", protectRoute, asyncHandler(update));

export default router;
