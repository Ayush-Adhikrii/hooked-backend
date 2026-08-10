import express from "express";
import { findAll, findPhotosByUserId, savePhoto, uploadPhoto } from "../controllers/PhotosController.js";
import asyncHandler from "../middleware/asyncHandler.js";
import { protectRoute } from "../middleware/auth.js";
import { photo } from "../middleware/photos.js";

const router = express.Router();

router.post("/uploadphoto", protectRoute, photo, asyncHandler(uploadPhoto));
router.post("/", protectRoute, asyncHandler(savePhoto));
router.get("/", protectRoute, asyncHandler(findAll));
router.get("/:userId", protectRoute, asyncHandler(findPhotosByUserId));

export default router;
