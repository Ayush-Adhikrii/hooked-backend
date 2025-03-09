import UserDetails from "../models/UserDetails.js";

// Find all userDetails
export const findAll = async (req, res) => {
    try {
        const userDetails = await UserDetails.find().populate(["userId"]);
        res.status(200).json(userDetails);
    } catch (error) {
        console.error("Error fetching userDetails:", error);
        res.status(500).json({ message: "Internal server error", error });
    }
};

// Save a new user
export const saveDetails = async (req, res) => {
    console.log("Save details called")
    console.log("Request Body:", req.body);
    try {
        const userDetail = new UserDetails(req.body); // Create a new user instance with data from the request body
        const saveduserDetail = await userDetail.save(); // Save the userDetail to the database
        res.status(201).json(saveduserDetail); // Send back the saved userDetail
    } catch (error) {
        console.error("Error saving userDetail:", error);
        res.status(400).json({ message: "Failed to save userDetail", error });
    }
};

// Find a userDetail by ID
export const findById = async (req, res) => {
    try {
        const userDetail = await UserDetails.findById(req.params.id); // Get the ID from the request params
        if (!userDetail) {
            return res.status(404).json({ message: "userDetail not found" });
        }
        res.status(200).json(userDetail); // Send back the userDetail
    } catch (error) {
        console.error("Error fetching userDetail by ID:", error);
        res.status(500).json({ message: "Internal server error", error });
    }
};

// Fi// Find a userDetail by User ID, or create it if it doesn't exist
export const findByUserId = async (req, res) => {
    try {
        const userId = req.params.id; // Get the User ID from the request params

        // Try to find the UserDetail by userId
        let userDetail = await UserDetails.findOne({ userId: userId });
        console.log("controller", userDetail)

        if (!userDetail) {
            // If no userDetail is found, create a new one with the given userId
            userDetail = await UserDetails.create({ userId: userId });
            return res.status(201).json(userDetail); // Created a new userDetail
        }

        console.log("data got here:", userDetail);
        res.status(200).json(userDetail); // Send back the userDetail if found
    } catch (error) {
        console.error("Error fetching or creating userDetail:", error);
        res.status(500).json({ message: "Internal server error", error });
    }
};



// Delete a userDetail by ID
export const deleteById = async (req, res) => {
    try {
        const userDetail = await UserDetails.findByIdAndDelete(req.params.id); // Find and delete the userDetail
        if (!userDetail) {
            return res.status(404).json({ message: "userDetail not found" });
        }
        res.status(200).json({ message: "userDetail deleted successfully", userDetail });
    } catch (error) {
        console.error("Error deleting userDetail:", error);
        res.status(500).json({ message: "Internal server error", error });
    }
};

export const update = async (req, res) => {
    try {
        const userId = req.params.id; // Get the User ID from the request params (assuming you're using 'id' in the route)

        // Use the 'userId' field to find the UserDetails document and update it
        const updatedUserDetail = await UserDetails.findOneAndUpdate(
            { userId: userId }, // Match by the 'userId' field
            req.body, // Data to update
            { new: true, runValidators: true } // Options: return the updated document and validate the updates
        );

        if (!updatedUserDetail) {
            return res.status(404).json({ message: "userDetail not found for this userId" });
        }

        res.status(200).json(updatedUserDetail); // Send back the updated userDetail
    } catch (error) {
        console.error("Error updating userDetail:", error);
        res.status(400).json({ message: "Failed to update userDetail", error });
    }
};


export const findDetail = async (req, res) => {
    console.log("Detail");
    try {
        const userId = req.user._id;

        // Try to find the UserDetail by userId
        let userDetail = await UserDetails.findOne({ userId: userId });

        if (!userDetail) {
            // If no userDetail is found, create a new one with the given userId
            userDetail = await UserDetails.create({ userId: userId });
            return res.status(201).json(userDetail); // Created a new userDetail
        }

        console.log("data got here:", userDetail);
        res.status(200).json(userDetail); // Send back the userDetail if found
    } catch (error) {
        console.error("Error fetching or creating userDetail:", error);
        res.status(500).json({ message: "Internal server error", error });
    }
};


export const updateDetail = async (req, res) => {
    try {
        const userId = req.user._id; // Get the User ID from the request params (assuming you're using 'id' in the route)

        // Use the 'userId' field to find the UserDetails document and update it
        const updatedUserDetail = await UserDetails.findOneAndUpdate(
            { userId: userId }, // Match by the 'userId' field
            req.body, // Data to update
            { new: true, runValidators: true } // Options: return the updated document and validate the updates
        );

        if (!updatedUserDetail) {
            return res.status(404).json({ message: "userDetail not found for this userId" });
        }

        res.status(200).json(updatedUserDetail); // Send back the updated userDetail
    } catch (error) {
        console.error("Error updating userDetail:", error);
        res.status(400).json({ message: "Failed to update userDetail", error });
    }
};
