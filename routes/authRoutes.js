import express from "express";
import { authLimiter } from "../middleware/rateLimiters.js";
import {
	changePassword,
	checkPassword,
	deleteMyAccount,
	findAll,
	findById,
	login,
	logout,
	signup,
	update,
	uploadImage,
} from "../controllers/authController.js";
import asyncHandler from "../middleware/asyncHandler.js";
import { protectRoute } from "../middleware/auth.js";
import { validate } from "../middleware/validate.js";
import { loginSchema, signupSchema, updateProfileSchema } from "../validation/authSchemas.js";
import { upload } from "../middleware/uploads.js";

const router = express.Router();

router.get("/", protectRoute, asyncHandler(findAll));
router.get("/find/:id", protectRoute, asyncHandler(findById));

router.post("/signup", authLimiter, validate(signupSchema), asyncHandler(signup));
router.post("/login", authLimiter, validate(loginSchema), asyncHandler(login));
router.put("/update/:id", protectRoute, validate(updateProfileSchema), asyncHandler(update));
router.post("/logout", logout);
router.post("/uploadImage", upload, asyncHandler(uploadImage));
router.put("/changePassword", protectRoute, authLimiter, asyncHandler(changePassword));
router.post("/checkPassword", protectRoute, authLimiter, asyncHandler(checkPassword));
router.delete("/me", protectRoute, asyncHandler(deleteMyAccount));

router.get("/me", protectRoute, (req, res) => {
	res.json({
		success: true,
		user: req.user,
	});
});

export default router;
