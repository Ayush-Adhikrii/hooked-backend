// routes/esewaRoutes.js
import express from "express";
import { createOrder, verifyPayment } from "../controllers/esewaController.js";
import asyncHandler from "../middleware/asyncHandler.js";
import { protectRoute } from "../middleware/auth.js";

const router = express.Router();

router.post("/success", protectRoute, asyncHandler(verifyPayment));
router.post("/create", protectRoute, asyncHandler(createOrder));

export default router;
