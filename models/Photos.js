import mongoose from "mongoose";

const photosSchema = new mongoose.Schema({
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
        required: true
    },

    image: {
        type: String,
        required: false
    }


});

const Photos = mongoose.model("Photos", photosSchema);
export default Photos;