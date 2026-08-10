// api/socket/socket.server.js
import { Server } from "socket.io";

let io = null;

const connectedUsers = new Map();

export const initializeSocket = (httpServer) => {
	io = new Server(httpServer, {
		cors: {
			origin: [process.env.CLIENT_URL, "http://192.168.1.69:5000", "http://10.0.2.2:5000"],
			credentials: true,
		},
	});

	io.use((socket, next) => {
		const userId = socket.handshake.auth.userId;
		if (!userId) return next(new Error("Invalid user ID"));
		socket.userId = userId;
		next();
	});

	io.on("connection", (socket) => {
		connectedUsers.set(socket.userId, socket.id);

		socket.on("sendMessage", (data) => {
			const message = {
				_id: data._id,
				sender: socket.userId,
				receiver: data.receiverId,
				content: data.content,
				createdAt: new Date().toISOString(),
				updatedAt: new Date().toISOString(),
			};
			const receiverSocketId = connectedUsers.get(data.receiverId);
			if (receiverSocketId) {
				io.to(receiverSocketId).emit("newMessage", { message });
			}
			socket.emit("newMessage", { message });
		});

		socket.on("disconnect", () => {
			connectedUsers.delete(socket.userId);
		});
	});

	return io;
};

// Returns null rather than throwing when the socket server hasn't been
// initialized (e.g. in tests that exercise the app without a real HTTP
// server) - callers treat "no live socket" as simply nothing to push to.
export const getIO = () => io;

export const getConnectedUsers = () => connectedUsers;
