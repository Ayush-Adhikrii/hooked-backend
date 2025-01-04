const express = require("express");
const { findAll, save, findById, deleteById, update } = require("../controller/userController");
const router = express.Router();

// Get all users
router.get("/", findAll);

// Save a new user
router.post("/", save);

// Get a user by ID
router.get("/:id", findById);

// Update a user by ID
router.put("/:id", update);

// Delete a user by ID
router.delete("/:id", deleteById);

module.exports = router;
