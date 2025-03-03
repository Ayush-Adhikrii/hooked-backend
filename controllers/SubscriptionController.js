import Subscription from "../models/Subscription.js";


export const findAll = async (req, res) => {
    try {
        const subuscriptions = await Subscription.find().populate(["userId"]);
        res.status(200).json(subuscriptions);

    } catch (e) {
        console.error("errot finding subuscription", e)
    }
}


export const save = async (req, res) => {
    try {
        const { userId, subscriptionType, subscribedOn, expiresOn } = req.body;

        // Check if a subscription already exists for the user
        let existingSubscription = await Subscription.findOne({ userId });

        if (existingSubscription) {
            // Update existing subscription
            existingSubscription.subscriptionType = subscriptionType;
            existingSubscription.subscribedOn = subscribedOn;
            existingSubscription.expiresOn = expiresOn;

            const updatedSubscription = await existingSubscription.save();
            return res.status(200).json({
                message: "Subscription updated successfully",
                subscription: updatedSubscription,
            });
        } else {
            // Create a new subscription
            const newSubscription = new Subscription({ userId, subscriptionType, subscribedOn, expiresOn });
            const savedSubscription = await newSubscription.save();
            console.log("saved is", savedSubscription);
            return res.status(201).json({
                message: "Subscription created successfully",
                subscription: savedSubscription,
            });
        }
    } catch (e) {
        console.error("Error saving subscription:", e);
        res.status(500).json({ message: "Internal Server Error" });
    }
};


export const findById = async (req, res) => {
    try {
        const { userId } = req.params;

        // Find the user's subscription
        const subscription = await Subscription.findOne({ userId });

        if (!subscription) {
            return res.status(404).json({ message: "User does not have an active subscription." });
        }

        // Return only the expiration date
        res.status(200).json({ expiresOn: subscription.expiresOn });
    } catch (error) {
        console.error("Error fetching subscription:", error);
        res.status(500).json({ message: "Internal Server Error" });
    }
}

export const deleteById = async (req, res) => {
    try {
        const subscription = await Subscription.findByIdAndDelete(req.prams.id);
        if (!subscription) {
            res.status(404).json({ message: "Not found" })
        }
        res.status(200).json(subscription);
    } catch (e) {
        console.error("error deleting subscription", e)
        res.status(500).json({ message: "internal server error", subscription })
    }
}

export const update = async (req, res) => {
    try {
        const updatedSubuscription = await Subscription.findByIdAndUpdate(
            req.prams.id,
            req.body,
            { new: true, runValidators: true }
        );
        res.status(201).json(updatedSubuscription);

    } catch (e) {
        console.error("error updating data", e)
    }
}
