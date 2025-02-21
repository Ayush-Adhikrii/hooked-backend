import express from "express";
import { deleteById, findAll, findById, findByUserId, saveDetails, update } from "../controllers/UserDetailsController.js";
const router = express.Router();

// Get all userDetails
router.get("/", findAll);

// Save a new userDetails
router.post("/", saveDetails);

// Get a userDetails by ID
router.get("/:id", findById);

// Get a userDetails by ID
router.get("/user/:id", findByUserId);

// Update a userDetails by ID
router.put("/:id", update);

// Delete a userDetails by ID
router.delete("/:id", deleteById);

export default router;
