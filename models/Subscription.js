import mongoose from "mongoose";

const subscriptionSchema = new mongoose.Schema({
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
        require: true
    },

    subscriptionType: {
        type: String,
        enum: ["Silver", "Gold", "Platinum"],
        required: true
    },
    subscribedOn: {
        type: Date,
        required: true
    },
    expiresOn: {
        type: Date,
        required: true
    }

});

const Subscription= mongoose.model("Subscription", subscriptionSchema);    
export default Subscription;