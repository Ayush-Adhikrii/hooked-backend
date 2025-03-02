import express from "express";
import { changePassword, checkPassword, findAll, findById, login, logout, signup, update, uploadImage } from "../controllers/authController.js";
import { protectRoute } from "../middleware/auth.js";
import { upload } from "../middleware/uploads.js";

const router = express.Router();

router.get("/", findAll);
router.get("/find/:id", findById);

router.post("/signup", signup);
router.post("/login", login);
router.put("/update/:id", update);
router.post("/logout", logout);
router.post("/uploadImage", upload, uploadImage);
router.put("/changePassword", changePassword);
router.post("/checkPassword", checkPassword);

router.get("/me", protectRoute, (req, res) => {
	console.log("theuseris", req.user);
	res.send({
		success: true,
		user: req.user,
	});
});

export default router;
