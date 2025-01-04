const mongoose = require("mongoose");

const userDetailsSchema = new mongoose.Schema({
    userId: {
        type: mongoose.Schema.Types.ObjectId, // Foreign key referencing User table
        ref: "User",
        required: true
    },
    profession: {
        type: String,
        required: false
    },
    education: {
        type: String,
        required: false
    },
    height: {
        type: Number, // Height in cm (or other preferred unit)
        required: false
    },
    exercise: {
        type: String,
        enum: ['Yes', 'No', 'Sometimes'], // Limits to specified values
        required: false
    },
    drinks: {
        type: String,
        enum: ['Yes', 'No', 'Occasionally'], // Limits to specified values
        required: false
    },
    smoke: {
        type: String,
        enum: ['Yes', 'No', 'Smoker when drinking'], // Limits to specified values
        required: false
    },
    kids: {
        type: String, // Description of kids (e.g., "2 kids", "No kids", etc.)
        required: false
    },
    religion: {
        type: String,
        enum: ['Hindu', 'Christian', 'Muslim', 'Buddhist', 'Atheist'], // Limits to specified religions
        required: false
    }
});

module.exports = mongoose.model("UserDetails", userDetailsSchema);
