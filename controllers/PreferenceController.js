import Preference from "../models/Preference.js";

export const save = async (req, res) => {
    try {
        const preference = new Preference(req.body);
        const savedPreference = await preference.save();
        res.status(201).json(savedPreference);
    } catch (error) {
        console.error("Error saving preference:", error);
        res.status(400).json({ message: "Failed to save preference", error });
    }
};


export const findAll = async (req, res) => {
    try {
        const preferences = await Preference.find().populate(["userId"]);
        res.status(200).json(preferences);
    } catch (e) {
        res.status(500).json({ error: "Failed to fetch preferences", details: e.message });
    }
};

export const findById = async (req, res) => {
    try {
        const { id } = req.params;
        const preference = await Preference.findById(id).populate("userId", "name email");
        if (!preference) {
            return res.status(404).json({ error: "Preferences not found" });
        }
        res.status(200).json(preference);
    } catch (e) {
        res.status(500).json({ error: "Failed to fetch preferences", details: e.message });
    }
};

export const deleteById = async (req, res) => {
    try {
        const { id } = req.params;
        const deletedPreference = await Preference.findByIdAndDelete(id);
        if (!deletedPreference) {
            return res.status(404).json({ error: "Preferences not found" });
        }
        res.status(200).json({ message: "Preferences deleted successfully" });
    } catch (e) {
        res.status(500).json({ error: "Failed to delete preferences", details: e.message });
    }
};

export const update = async (req, res) => {
    try {
        const { id } = req.params;
        const { preferredGender, minAge, maxAge, relationType, preferredStarSign, preferredReligion } = req.body;
        const updatedPreference = await Preference.findByIdAndUpdate(
            id,
            { preferredGender, minAge, maxAge, relationType, preferredStarSign, preferredReligion },
            { new: true, runValidators: true }
        );
        if (!updatedPreference) {
            return res.status(404).json({ error: "Preferences not found" });
        }
        res.status(200).json(updatedPreference);
    } catch (e) {
        res.status(500).json({ error: "Failed to update preferences", details: e.message });
    }
};

export const findPreferenceByUserId = async (req, res) => {
    try {
        let preference = await Preference.findOne({ userId: req.params.id }); // Use findOne() instead of find()
        console.log("User ID:", req.params.id);

        if (!preference) {
            const defaultPreferences = {
                userId: req.params.id,
                applyFilter: false,
                preferredGender: "any",
                minAge: 16,
                maxAge: 60,
                relationType: "any",
                preferredStarSign: "any",
                preferredReligion: "any"
            };

            preference = new Preference(defaultPreferences);
            preference = await preference.save();
            console.log("New preference created:", preference);
        }

        return res.status(200).json(preference);
    } catch (error) {
        console.error("Error finding preference:", error);
        return res.status(500).json({ message: "Internal server error" });
    }
};


export const updatePreferenceByUserId = async (req, res) => {
    console.log("inside update pref")
    try {
        // Extract user id from route parameters
        const userId = req.params.id;
        const { preferredGender, minAge, maxAge, relationType, preferredStarSign, preferredReligion } = req.body;

        // Find and update the preference for that user
        const updatedPreference = await Preference.findOneAndUpdate(
            { userId },
            { preferredGender, minAge, maxAge, relationType, preferredStarSign, preferredReligion },
            { new: true, runValidators: true }
        );

        if (!updatedPreference) {
            return res.status(404).json({ error: "Preference not found" });
        }

        res.status(200).json(updatedPreference);
    } catch (error) {
        console.error("Error updating preference by user id:", error);
        res.status(500).json({ message: "Failed to update preference", error });
    }
};
