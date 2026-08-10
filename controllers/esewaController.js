// controllers/esewaController.js
import crypto from "crypto";
import { v4 } from "uuid";
import Subscription from "../models/Subscription.js";
import { BadRequestError, ForbiddenError } from "../utils/AppError.js";

export const createSignature = (message) => {
	const secret = process.env.ESEWA_SECRET_KEY;
	const hmac = crypto.createHmac("sha256", secret);
	hmac.update(message);
	return hmac.digest("base64");
};

export const createOrder = async (req, res) => {
	const { amount, subscriptionType, userId } = req.body;

	if (userId !== req.user.id) {
		throw new ForbiddenError();
	}

	const transactionUuid = v4();

	const signature = createSignature(`total_amount=${amount},transaction_uuid=${transactionUuid},product_code=EPAYTEST`);

	const formData = {
		amount,
		failure_url: `${process.env.CLIENT_URL}/failure`,
		product_delivery_charge: "0",
		product_service_charge: "0",
		product_code: "EPAYTEST",
		signature,
		signed_field_names: "total_amount,transaction_uuid,product_code",
		success_url: `${process.env.CLIENT_URL}/success`,
		tax_amount: "0",
		total_amount: amount,
		transaction_uuid: transactionUuid,
		userId,
		subscriptionType,
	};

	res.json({
		message: "Order Created Successfully",
		formData,
		payment_method: "esewa",
	});
};

const SUBSCRIPTION_DURATIONS_MS = {
	Silver: 30 * 24 * 60 * 60 * 1000,
	Gold: 90 * 24 * 60 * 60 * 1000,
	Platinum: 180 * 24 * 60 * 60 * 1000,
};

export const verifyPayment = async (req, res) => {
	const { userId, subscriptionType, status } = req.body;

	if (userId !== req.user.id) {
		throw new ForbiddenError();
	}
	if (status !== "COMPLETE") {
		throw new BadRequestError("Payment not completed");
	}

	const duration = SUBSCRIPTION_DURATIONS_MS[subscriptionType];
	if (!duration) {
		throw new BadRequestError("Invalid subscription type");
	}

	const subscribedOn = new Date();
	const expiresOn = new Date(subscribedOn.getTime() + duration);

	let subscription = await Subscription.findOne({ userId });

	if (subscription) {
		subscription.subscriptionType = subscriptionType;
		subscription.subscribedOn = subscribedOn;
		subscription.expiresOn = expiresOn;
		await subscription.save();
		return res.status(200).json({ message: "Subscription updated successfully", subscription });
	}

	subscription = await Subscription.create({ userId, subscriptionType, subscribedOn, expiresOn });
	res.status(201).json({ message: "Subscription created successfully", subscription });
};
