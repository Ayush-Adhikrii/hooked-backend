import express from "express";
import { findAll, savePhoto, uploadPhoto } from "../controllers/PhotosController.js";
import { photo } from "../middleware/photos.js";

const router = express.Router();


router.post("/uploadphoto", photo, uploadPhoto);
router.post("/", savePhoto);
router.get("/", findAll);



export default router;
