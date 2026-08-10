import Message from "../models/Message.js";
import User from "../models/User.js";
import { getConnectedUsers, getIO } from "../socket/socket.server.js";
import { BadRequestError, ForbiddenError } from "../utils/AppError.js";

export const sendMessage = async (req, res) => {
	const { content, receiverId } = req.body;

	if (!receiverId || !content?.trim()) {
		throw new BadRequestError("receiverId and content are required");
	}

	const currentUser = await User.findById(req.user.id);
	const isMatch = currentUser.matches.some((id) => id.toString() === receiverId);
	if (!isMatch) {
		throw new ForbiddenError("You can only message your matches");
	}

	const newMessage = await Message.create({
		sender: req.user.id,
		receiver: receiverId,
		content: content.trim(),
	});

	const io = getIO();
	const connectedUsers = getConnectedUsers();
	const receiverSocketId = connectedUsers.get(receiverId);

	if (io && receiverSocketId) {
		io.to(receiverSocketId).emit("newMessage", {
			message: newMessage,
		});
	}

	res.status(201).json({
		success: true,
		message: newMessage,
	});
};

export const getConversation = async (req, res) => {
	const { userId } = req.params;

	// Default limit is generous so existing callers that don't pass
	// page/limit keep seeing the full recent conversation they always have.
	const page = Math.max(parseInt(req.query.page, 10) || 1, 1);
	const limit = Math.min(Math.max(parseInt(req.query.limit, 10) || 200, 1), 500);

	const query = {
		$or: [
			{ sender: req.user._id, receiver: userId },
			{ sender: userId, receiver: req.user._id },
		],
	};

	const [messages, total] = await Promise.all([
		Message.find(query)
			.sort("createdAt")
			.skip((page - 1) * limit)
			.limit(limit),
		Message.countDocuments(query),
	]);

	res.status(200).json({
		success: true,
		messages,
		page,
		limit,
		total,
		hasMore: page * limit < total,
	});
};
