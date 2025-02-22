import mongoose from "mongoose";

const preferenceSchema = new mongoose.Schema({
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
        required: true
    },

    preferredGender: {
        type: String,
        enum: ['Male', 'Female', 'Other'],
        required: false
    },

    minAge: {
        type: Number,
        required: false
    },

    maxAge: {
        type: Number,
        required: false
    },

    relationType: {
        type: String,
        enum: ['Casual dates', 'Long term relationship', 'Marriage', 'Friendship'],
        required: false
    },

    preferredStarSign: {
        type: String,
        required: false
    },

    preferredReligion: {
        type: String,
        enum: ['Hindu', 'Christian', 'Muslim', 'Buddhist', 'Atheist'],
        required: false
    },


});

const prefe =  mongoose.model("Preferences", preferenceSchema);
export default prefe;