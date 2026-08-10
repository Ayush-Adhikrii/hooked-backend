import Subscription from "../models/Subscription.js";
import { ForbiddenError, NotFoundError } from "../utils/AppError.js";

export const findAll = async (req, res) => {
	const subscriptions = await Subscription.find().populate(["userId"]);
	res.status(200).json(subscriptions);
};

export const save = async (req, res) => {
	const { userId, subscriptionType, subscribedOn, expiresOn } = req.body;

	if (userId !== req.user.id) {
		throw new ForbiddenError();
	}

	let existingSubscription = await Subscription.findOne({ userId });

	if (existingSubscription) {
		existingSubscription.subscriptionType = subscriptionType;
		existingSubscription.subscribedOn = subscribedOn;
		existingSubscription.expiresOn = expiresOn;

		const updatedSubscription = await existingSubscription.save();
		return res.status(200).json({
			message: "Subscription updated successfully",
			subscription: updatedSubscription,
		});
	}

	const newSubscription = new Subscription({ userId, subscriptionType, subscribedOn, expiresOn });
	const savedSubscription = await newSubscription.save();
	res.status(201).json({
		message: "Subscription created successfully",
		subscription: savedSubscription,
	});
};

export const findById = async (req, res) => {
	const { userId } = req.params;

	if (userId !== req.user.id) {
		throw new ForbiddenError();
	}

	const subscription = await Subscription.findOne({ userId });
	if (!subscription) {
		throw new NotFoundError("User does not have an active subscription.");
	}

	res.status(200).json({ expiresOn: subscription.expiresOn });
};

export const deleteById = async (req, res) => {
	const subscription = await Subscription.findByIdAndDelete(req.params.id);
	if (!subscription) throw new NotFoundError();
	res.status(200).json(subscription);
};

export const update = async (req, res) => {
	const updatedSubscription = await Subscription.findByIdAndUpdate(req.params.id, req.body, {
		new: true,
		runValidators: true,
	});
	if (!updatedSubscription) throw new NotFoundError();
	res.status(201).json(updatedSubscription);
};
