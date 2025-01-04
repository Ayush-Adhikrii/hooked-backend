const mongoose = require("mongoose");

const userSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true
    },
    email: {
        type: String,
        required: true,
        unique: true // Ensures email is unique
    },
    phoneNumber: {
        type: String,
        required: true,
        unique: true // Ensures number is unique
    },
    password: {
        type: String,
        required: true
    },
    gender: {
        type: String,
        enum: ['Male', 'Female', 'Other'], // Optional: limits gender to specific values
        required: false
    },
    birthDate: {
        type: Date, // Stores the date of birth
        required: false
    },
    starSign: {
        type: String,
        required: false
    },
    bio: {
        type: String,
        maxlength: 500, // Optional: limits bio to 500 characters
        required: false
    },
    profilePhoto: {
        type: String, // Stores the URL or path to the profile photo
        required: false
    }
});

module.exports = mongoose.model("User", userSchema);
