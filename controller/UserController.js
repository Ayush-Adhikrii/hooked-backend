const User = require("../model/User");

// Find all users
const findAll = async (req, res) => {
    try {
        const users = await User.find();
        res.status(200).json(users);
    } catch (error) {
        console.error("Error fetching users:", error);
        res.status(500).json({ message: "Internal server error", error });
    }
};

// Save a new user
const save = async (req, res) => {
    try {
        const user = new User(req.body); // Create a new user instance with data from the request body
        const savedUser = await user.save(); // Save the user to the database
        res.status(201).json(savedUser); // Send back the saved user
    } catch (error) {
        console.error("Error saving user:", error);
        res.status(400).json({ message: "Failed to save user", error });
    }
};

// Find a user by ID
const findById = async (req, res) => {
    try {
        const user = await User.findById(req.params.id); // Get the ID from the request params
        if (!user) {
            return res.status(404).json({ message: "User not found" });
        }
        res.status(200).json(user); // Send back the user
    } catch (error) {
        console.error("Error fetching user by ID:", error);
        res.status(500).json({ message: "Internal server error", error });
    }
};

// Delete a user by ID
const deleteById = async (req, res) => {
    try {
        const user = await User.findByIdAndDelete(req.params.id); // Find and delete the user
        if (!user) {
            return res.status(404).json({ message: "User not found" });
        }
        res.status(200).json({ message: "User deleted successfully", user });
    } catch (error) {
        console.error("Error deleting user:", error);
        res.status(500).json({ message: "Internal server error", error });
    }
};

// Update a user by ID
const update = async (req, res) => {
    try {
        const updatedUser = await User.findByIdAndUpdate(
            req.params.id, // Get the ID from the request params
            req.body, // Data to update
            { new: true, runValidators: true } // Options: return the updated document and validate the updates
        );
        if (!updatedUser) {
            return res.status(404).json({ message: "User not found" });
        }
        res.status(200).json(updatedUser); // Send back the updated user
    } catch (error) {
        console.error("Error updating user:", error);
        res.status(400).json({ message: "Failed to update user", error });
    }
};

module.exports = {
    findAll,
    save,
    findById,
    deleteById,
    update,
};
