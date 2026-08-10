import { createServer } from "http";
import app from "./app.js";
import { connectDB } from "./config/db.js";
import { initializeSocket } from "./socket/socket.server.js";

const httpServer = createServer(app);
const PORT = process.env.PORT || 5000;

initializeSocket(httpServer);

httpServer.listen(PORT, () => {
	console.log("Server started at this port:" + PORT);
	connectDB();
});
