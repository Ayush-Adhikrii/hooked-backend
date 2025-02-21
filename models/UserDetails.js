import mongoose from "mongoose";

const userDetailsSchema = new mongoose.Schema({
    userId: {
        type: mongoose.Schema.Types.ObjectId,
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
        type: Number,
        required: false
    },
    exercise: {
        type: String,
        required: false
    },
    drinks: {
        type: String,
        required: false
    },
    smoke: {
        type: String,
        required: false
    },
    kids: {
        type: String,
        required: false
    },
    religion: {
        type: String,
        required: false
    }
});

const details = mongoose.model("UserDetails", userDetailsSchema);
export default details;