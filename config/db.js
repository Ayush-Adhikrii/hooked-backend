const mongoose = require("mongoose")

const connectDB = async () => {
    try {
        await mongoose.connect("mongodb://localhost:27017/hooked_dating_app");
        console.log("mongo db connected");

    } catch (e) {
        console.log("mongo db not connected");
    }

}


module.exports = connectDB;