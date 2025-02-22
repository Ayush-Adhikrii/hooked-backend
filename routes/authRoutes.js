import express from "express";
import { findAll, findById, login, logout, signup, update, changePassword, uploadImage } from "../controllers/authController.js";
import { protectRoute } from "../middleware/auth.js";
import { upload } from "../middleware/uploads.js";

const router = express.Router();

router.get("/", findAll);
router.get("/:id", findById);

router.post("/signup", signup);
router.post("/login", login);
router.put("/update/:id", update);
router.post("/logout", logout);
router.post("/uploadImage", upload, uploadImage);
router.put("/changePAssword",changePassword);

router.get("/me", protectRoute, (req, res) => {
	res.send({
		success: true,
		user: req.user,
	});
});

export default router;
