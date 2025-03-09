// controllers/esewaController.js
import crypto from "crypto";
import { v4 } from "uuid";
import Subscription from "../models/Subscription.js";

export const createOrder = async (req, res, next) => {
  try {
    const { amount, subscriptionType, userId } = req.body;
    const transactionUuid = v4(); // Create a unique transaction ID

    console.log("The userId, subscription type, and amount are ", userId, subscriptionType, amount);

    const signature = createSignature(
      `total_amount=${amount},transaction_uuid=${transactionUuid},product_code=EPAYTEST`
    );

    const formData = {
      amount: amount,
      failure_url: `http://localhost:5173/failure`,
      product_delivery_charge: "0",
      product_service_charge: "0",
      product_code: "EPAYTEST",
      signature: signature,
      signed_field_names: "total_amount,transaction_uuid,product_code",
      success_url: `http://localhost:5173/success`,
      tax_amount: "0",
      total_amount: amount,
      transaction_uuid: transactionUuid,
      userId: userId,
      subscriptionType: subscriptionType,
    };

    res.json({
      message: "Order Created Successfully",
      formData,
      payment_method: "esewa",
    });
  } catch (e) {
    console.error("Error in createOrder:", e);
    res.status(500).json({ message: "Internal Server Error" });
  }
};

export const verifyPayment = async (req, res, next) => {
  console.log("verifyPayment called with:", req.body);
  try {
    // In a mobile app, the data is sent via POST request from the app
    const { userId, subscriptionType, status } = req.body;

    console.log("verifyPayment called with:", { userId, subscriptionType, status });

    if (status !== "COMPLETE") {
      return res.status(400).json({ message: "Payment not completed" });
    }

    // Calculate subscribedOn and expiresOn dates
    const subscribedOn = new Date();
    let expiresOn;
    if (subscriptionType === "Silver") {
      expiresOn = new Date(subscribedOn.getTime() + 30 * 24 * 60 * 60 * 1000); // 1 month
    } else if (subscriptionType === "Gold") {
      expiresOn = new Date(subscribedOn.getTime() + 90 * 24 * 60 * 60 * 1000); // 3 months
    } else if (subscriptionType === "Platinum") {
      expiresOn = new Date(subscribedOn.getTime() + 180 * 24 * 60 * 60 * 1000); // 6 months
    } else {
      throw new Error("Invalid subscription type");
    }

    // Check if a subscription already exists for the user
    let existingSubscription = await Subscription.findOne({ userId });

    let subscription;
    if (existingSubscription) {
      // Update existing subscription
      existingSubscription.subscriptionType = subscriptionType;
      existingSubscription.subscribedOn = subscribedOn;
      existingSubscription.expiresOn = expiresOn;

      subscription = await existingSubscription.save();
      console.log("Subscription updated successfully:", subscription);
      return res.status(200).json({
        message: "Subscription updated successfully",
        subscription: subscription,
      });
    } else {
      // Create a new subscription
      const newSubscription = new Subscription({
        userId,
        subscriptionType,
        subscribedOn,
        expiresOn,
      });
      subscription = await newSubscription.save();
      console.log("Subscription created successfully:", subscription);
      return res.status(201).json({
        message: "Subscription created successfully",
        subscription: subscription,
      });
    }
  } catch (err) {
    console.log("Error in verifyPayment:", err.message);
    return res.status(400).json({ error: err?.message || "Payment verification failed" });
  }
};

export const createSignature = (message) => {
  const secret = "8gBm/:&EnhH.1/q";
  const hmac = crypto.createHmac("sha256", secret);
  hmac.update(message);
  const hashInBase64 = hmac.digest("base64");
  return hashInBase64;
};