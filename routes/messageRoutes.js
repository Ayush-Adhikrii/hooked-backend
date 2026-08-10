import express from "express";
import { getConversation, sendMessage } from "../controllers/messageController.js";
import asyncHandler from "../middleware/asyncHandler.js";
import { protectRoute } from "../middleware/auth.js";

const router = express.Router();

router.use(protectRoute);

router.post("/send", asyncHandler(sendMessage));
router.get("/conversation/:userId", asyncHandler(getConversation));

export default router;
