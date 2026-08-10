import Message from "../models/Message.js";
import Preference from "../models/Preference.js";
import Subscription from "../models/Subscription.js";
import User from "../models/User.js";
import { getConnectedUsers, getIO } from "../socket/socket.server.js";
import { ForbiddenError, NotFoundError } from "../utils/AppError.js";

const emitNewMatch = (io, connectedUsers, targetUserId, matchProfile) => {
	if (!io) return;
	const socketId = connectedUsers.get(targetUserId.toString());
	if (socketId) {
		io.to(socketId).emit("newMatch", {
			_id: matchProfile._id,
			name: matchProfile.name,
			profilePhoto: matchProfile.profilePhoto,
		});
	}
};

const getAge = (birthDate) => {
	const parsed = new Date(birthDate);
	if (Number.isNaN(parsed.getTime())) return null;
	const diff = Date.now() - parsed.getTime();
	return Math.abs(new Date(diff).getUTCFullYear() - 1970);
};

export const swipeRight = async (req, res) => {
	const { likedUserId } = req.params;
	if (likedUserId === req.user.id) {
		throw new ForbiddenError("You cannot swipe on yourself");
	}

	const currentUser = await User.findById(req.user.id);
	const likedUser = await User.findById(likedUserId);

	if (!likedUser) {
		throw new NotFoundError("User not found");
	}

	if (!currentUser.likes.includes(likedUserId)) {
		currentUser.likes.push(likedUserId);
		await currentUser.save();

		// if the other user already liked us, it's a match, so let's update both users
		if (likedUser.likes.includes(currentUser.id)) {
			currentUser.matches.push(likedUserId);
			likedUser.matches.push(currentUser.id);

			await Promise.all([currentUser.save(), likedUser.save()]);

			// send notification in real-time with socket.io, if it's running
			const connectedUsers = getConnectedUsers();
			const io = getIO();
			emitNewMatch(io, connectedUsers, likedUserId, currentUser);
			emitNewMatch(io, connectedUsers, currentUser._id, likedUser);
		}
	}

	res.status(200).json({
		success: true,
		user: currentUser,
	});
};

export const swipeLeft = async (req, res) => {
	const { dislikedUserId } = req.params;
	const currentUser = await User.findById(req.user.id);

	if (!currentUser.dislikes.includes(dislikedUserId)) {
		currentUser.dislikes.push(dislikedUserId);
		await currentUser.save();
	}

	res.status(200).json({
		success: true,
		user: currentUser,
	});
};

// A Super Like instantly matches both users, bypassing the mutual-like
// requirement - gated on the caller having an active, unexpired subscription.
// Responds 402 (not 403) when the gate fails, so the frontend can
// distinguish "not premium" from a real authorization error and show the
// upgrade prompt instead of a generic error toast.
export const superLike = async (req, res) => {
	const { likedUserId } = req.params;
	if (likedUserId === req.user.id) {
		throw new ForbiddenError("You cannot super like yourself");
	}

	const subscription = await Subscription.findOne({ userId: req.user.id });
	const hasActiveSubscription = Boolean(subscription && subscription.expiresOn > new Date());

	if (!hasActiveSubscription) {
		return res.status(402).json({
			success: false,
			requiresSubscription: true,
			message: "Super Likes are a premium feature - subscribe to use them",
		});
	}

	const currentUser = await User.findById(req.user.id);
	const likedUser = await User.findById(likedUserId);
	if (!likedUser) {
		throw new NotFoundError("User not found");
	}

	if (!currentUser.likes.includes(likedUserId)) currentUser.likes.push(likedUserId);
	if (!currentUser.matches.includes(likedUserId)) currentUser.matches.push(likedUserId);
	if (!likedUser.likes.includes(currentUser.id)) likedUser.likes.push(currentUser.id);
	if (!likedUser.matches.includes(currentUser.id)) likedUser.matches.push(currentUser.id);

	await Promise.all([currentUser.save(), likedUser.save()]);

	const connectedUsers = getConnectedUsers();
	const io = getIO();
	emitNewMatch(io, connectedUsers, likedUserId, currentUser);

	res.status(200).json({
		success: true,
		matched: true,
		user: currentUser,
	});
};

// Each match is annotated with the most recent message exchanged with that
// person (or null if the pair hasn't messaged yet), and the list is sorted
// so the most recently active conversation shows up first - matches with no
// messages yet sort to the end, in the order Mongo returned them.
export const getMatches = async (req, res) => {
	const user = await User.findById(req.user.id).populate("matches", "name profilePhoto");

	const matches = await Promise.all(
		user.matches.map(async (match) => {
			const lastMessage = await Message.findOne({
				$or: [
					{ sender: req.user.id, receiver: match._id },
					{ sender: match._id, receiver: req.user.id },
				],
			})
				.sort({ createdAt: -1 })
				.select("content sender createdAt");

			return {
				_id: match._id,
				name: match.name,
				profilePhoto: match.profilePhoto,
				lastMessage: lastMessage
					? { content: lastMessage.content, sender: lastMessage.sender, createdAt: lastMessage.createdAt }
					: null,
			};
		})
	);

	matches.sort((a, b) => {
		const aTime = a.lastMessage ? new Date(a.lastMessage.createdAt).getTime() : 0;
		const bTime = b.lastMessage ? new Date(b.lastMessage.createdAt).getTime() : 0;
		return bTime - aTime;
	});

	res.status(200).json({
		success: true,
		matches,
	});
};

export const getLikers = async (req, res) => {
	const { userId } = req.params;

	if (userId !== req.user.id) {
		throw new ForbiddenError();
	}

	const currentUser = await User.findById(userId);
	if (!currentUser) {
		throw new NotFoundError("User not found.");
	}

	// Fetch users where the likes array contains the given userId
	let usersWhoLiked = await User.find({ likes: userId });

	// Filter out users already in currentUser's likes, dislikes, or matches
	usersWhoLiked = usersWhoLiked.filter(
		(user) =>
			!currentUser.likes.includes(user._id.toString()) &&
			!currentUser.dislikes.includes(user._id.toString()) &&
			!currentUser.matches.includes(user._id.toString())
	);

	if (!usersWhoLiked.length) {
		throw new NotFoundError("No new users have liked this user.");
	}

	res.status(200).json(usersWhoLiked);
};

export const getUserProfiles = async (req, res) => {
	// Get current user based on authenticated req.user.id
	const currentUser = await User.findById(req.user._id);
	if (!currentUser) {
		throw new NotFoundError("User not found");
	}

	// Get the current user's preference document
	const currentPreference = await Preference.findOne({ userId: req.user.id });

	// Start building the query criteria.
	// Exclude the current user as well as users already liked, disliked, or matched.
	const criteria = {
		_id: {
			$ne: currentUser.id,
			$nin: [
				...(currentUser.likes?.length ? currentUser.likes : []),
				...(currentUser.dislikes?.length ? currentUser.dislikes : []),
				...(currentUser.matches?.length ? currentUser.matches : []),
			],
		},
	};

	// Filter by gender if the preference is not "any"
	if (
		currentPreference &&
		currentPreference.preferredGender &&
		currentPreference.preferredGender.toLowerCase() !== "any"
	) {
		criteria.gender = currentPreference.preferredGender;
	}

	// Filter by preferred star sign if it is not "any"
	if (
		currentPreference &&
		currentPreference.preferredStarSign &&
		currentPreference.preferredStarSign.toLowerCase() !== "any"
	) {
		criteria.starSign = currentPreference.preferredStarSign;
	}

	// Filter by preferred religion if it is not "any"
	if (
		currentPreference &&
		currentPreference.preferredReligion &&
		currentPreference.preferredReligion.toLowerCase() !== "any"
	) {
		criteria.religion = currentPreference.preferredReligion;
	}

	// Now find users matching the constructed criteria.
	let users = await User.find(criteria);

	// birthDate is stored as a String, so age range filtering happens in
	// application code rather than as a Mongo query operator.
	if (currentPreference && (currentPreference.minAge || currentPreference.maxAge)) {
		const minAge = currentPreference.minAge ?? 18;
		const maxAge = currentPreference.maxAge ?? 100;
		users = users.filter((candidate) => {
			if (!candidate.birthDate) return true;
			const age = getAge(candidate.birthDate);
			return age === null || (age >= minAge && age <= maxAge);
		});
	}

	// Age filtering happens in JS above, so pagination is applied to the
	// already-filtered array rather than at the Mongo query level. Default
	// limit is generous so existing callers that don't pass page/limit keep
	// seeing the same-sized deck they always have.
	const page = Math.max(parseInt(req.query.page, 10) || 1, 1);
	const limit = Math.min(Math.max(parseInt(req.query.limit, 10) || 50, 1), 100);
	const total = users.length;
	const start = (page - 1) * limit;
	const paginated = users.slice(start, start + limit);

	res.status(200).json({
		success: true,
		users: paginated,
		page,
		limit,
		total,
		hasMore: start + limit < total,
	});
};
