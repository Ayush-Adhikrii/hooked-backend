import express from "express";
import { deleteById, findAll, findByUserId, findDetail, saveDetails, update, updateDetail } from "../controllers/UserDetailsController.js";
import { protectRoute } from "../middleware/auth.js";
const router = express.Router();


// Get all userDetails
router.get("/", findAll);

// Save a new userDetails
router.post("/", saveDetails);

// Delete a userDetails by ID
router.delete("/:id", deleteById);

router.get("/getDetail", protectRoute, findDetail);
router.put("/", protectRoute, updateDetail);

export default router;
