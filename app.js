import cookieParser from "cookie-parser";
import cors from "cors";
import dotenv from "dotenv";
import express from "express";
import helmet from "helmet";
import path from "path";
import { fileURLToPath } from "url";

// Loaded here (module top level, before the cors() call below reads
// process.env.CLIENT_URL) rather than in server.js, since ES module imports
// are hoisted and evaluated before the importing file's own statements -
// a dotenv.config() call in server.js would run too late to affect this file.
dotenv.config();

// routes
import authRoutes from "./routes/authRoutes.js";
import detailsRoutes from "./routes/detailsRoute.js";
import esewaRoutes from "./routes/esewaRoutes.js";
import matchRoutes from "./routes/matchRoutes.js";
import messageRoutes from "./routes/messageRoutes.js";
import photoRoutes from "./routes/photosRoutes.js";
import preferenceRoutes from "./routes/PreferenceRoutes.js";
import subscriptionRoutes from "./routes/SubscriptionRoutes.js";
import userDetailsRoutes from "./routes/userDetailsRoutes.js";

import errorHandler from "./middleware/errorHandler.js";

const __dirname = path.dirname(fileURLToPath(import.meta.url));

const app = express();

app.use(
	helmet({
		// Uploaded photos are fetched cross-origin by the frontend (a different
		// port in dev, a different domain in prod) - the default
		// cross-origin-resource-policy would silently block that.
		crossOriginResourcePolicy: { policy: "cross-origin" },
	})
);
app.use(express.json());
app.use(cookieParser());
app.use(
	cors({
		origin: [process.env.CLIENT_URL, "http://192.168.1.69:5000", "http://10.0.2.2:5000"],
		credentials: true,
	})
);

// Uploaded photos live under this backend's own /public folder and are
// served here as absolute URLs the frontend fetches directly (see lib/images.js
// on the client) - never written into or served from the frontend project.
app.use("/profilePhotos", express.static(path.join(__dirname, "public/profilePhotos")));
app.use("/userImages", express.static(path.join(__dirname, "public/userImages")));

app.use("/api/auth", authRoutes);
app.use("/api/userDetails", userDetailsRoutes);
app.use("/api/details", detailsRoutes);
app.use("/api/matches", matchRoutes);
app.use("/api/messages", messageRoutes);
app.use("/api/photos", photoRoutes);
app.use("/api/preference", preferenceRoutes);
app.use("/api/subscription", subscriptionRoutes);
app.use("/api/payment", esewaRoutes);

if (process.env.NODE_ENV === "production") {
	app.use(express.static(path.join(__dirname, "/client/dist")));

	app.get("*", (req, res) => {
		res.sendFile(path.resolve(__dirname, "client", "dist", "index.html"));
	});
}

app.use((req, res) => {
	res.status(404).json({ success: false, message: "Route not found" });
});

app.use(errorHandler);

export default app;
