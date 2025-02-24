import mongoose from "mongoose";

const preferenceSchema = new mongoose.Schema({
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
        required: true
    },
    applyFilter: {
        type: Boolean,
        default: false,
        required: false
    },

    preferredGender: {
        type: String,
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
        required: false
    },

    preferredStarSign: {
        type: String,
        required: false
    },

    preferredReligion: {
        type: String,
        required: false
    },


});

const prefe = mongoose.model("Preferences", preferenceSchema);
export default prefe;