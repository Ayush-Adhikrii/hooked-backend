import express from "express";
import { updateProfile } from "../controllers/userController.js";
import { protectRoute } from "../middleware/auth.js";

const router = express.Router();

router.put("/update", protectRoute, updateProfile);

export default router;
