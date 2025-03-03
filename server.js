import cookieParser from "cookie-parser";
import cors from "cors";
import dotenv from "dotenv";
import express from "express";
import { createServer } from "http";
import path from "path";

// routes
import authRoutes from "./routes/authRoutes.js";
import detailsRoutes from "./routes/detailsRoute.js";
import matchRoutes from "./routes/matchRoutes.js";
import messageRoutes from "./routes/messageRoutes.js";
import photoRoutes from "./routes/photosRoutes.js";
import preferenceRoutes from "./routes/PreferenceRoutes.js";
import subscriptionRoutes from "./routes/SubscriptionRoutes.js";
import userDetailsRoutes from "./routes/userDetailsRoutes.js";

import { connectDB } from "./config/db.js";
import { initializeSocket } from "./socket/socket.server.js";

dotenv.config();

const app = express();
const httpServer = createServer(app);
const PORT = process.env.PORT || 5000;

const __dirname = path.resolve();

initializeSocket(httpServer);

app.use(express.json());
app.use(cookieParser());
app.use(
	cors({
		origin: [
			process.env.CLIENT_URL,
			"http://192.168.1.69:5000",
			"http://10.0.2.2:5000"
		],


		credentials: true,
	})
);

app.use("/api/auth", authRoutes);
app.use("/api/userDetails", userDetailsRoutes);
app.use("/api/details", detailsRoutes);
app.use("/api/matches", matchRoutes);
app.use("/api/messages", messageRoutes);
app.use("/api/photos", photoRoutes);
app.use("/api/preference", preferenceRoutes);
app.use("/api/subscription", subscriptionRoutes);


if (process.env.NODE_ENV === "production") {
	app.use(express.static(path.join(__dirname, "/client/dist")));

	app.get("*", (req, res) => {
		res.sendFile(path.resolve(__dirname, "client", "dist", "index.html"));
	});
}

httpServer.listen(PORT, () => {
	console.log("Server started at this port:" + PORT);
	connectDB();
});
