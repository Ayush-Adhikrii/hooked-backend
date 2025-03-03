// api/socket/socket.server.js
import { Server } from "socket.io";

let io;

const connectedUsers = new Map();

export const initializeSocket = (httpServer) => {
	io = new Server(httpServer, {
		cors: {
			origin: [
				process.env.CLIENT_URL, 
				"http://192.168.1.69:5000", 
				"http://10.0.2.2:5000" 
			  ],
	
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
		console.log(`User connected with socket id: ${socket.id}, userId: ${socket.userId}`);
		connectedUsers.set(socket.userId, socket.id);

		socket.on("sendMessage", (data) => {
			console.log(`Message received from ${socket.userId}:`, data);
			const message = {
				_id: data._id,
				sender: socket.userId,
				receiver: data.receiverId,
				content: data.content,
				createdAt: new Date().toISOString(),
				updatedAt: new Date().toISOString(),
			};
			// Emit to receiver
			const receiverSocketId = connectedUsers.get(data.receiverId);
			if (receiverSocketId) {
				io.to(receiverSocketId).emit("newMessage", { message });
				console.log(`newMessage emitted to receiver ${data.receiverId} at socket ${receiverSocketId}`);
			} else {
				console.log(`Receiver ${data.receiverId} not connected`);
			}
			// Emit to sender
			socket.emit("newMessage", { message });
			console.log(`newMessage emitted to sender ${socket.userId} at socket ${socket.id}`);
		});

		socket.on("disconnect", () => {
			console.log(`User disconnected with socket id: ${socket.id}, userId: ${socket.userId}`);
			connectedUsers.delete(socket.userId);
		});
	});
};

export const getIO = () => {
	if (!io) {
		throw new Error("Socket.io not initialized!");
	}
	return io;
};

export const getConnectedUsers = () => connectedUsers;