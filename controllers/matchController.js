import Preference from "../models/Preference.js";
import User from "../models/User.js";
import { getConnectedUsers, getIO } from "../socket/socket.server.js";

export const swipeRight = async (req, res) => {
	try {
		const { likedUserId } = req.params;
		const currentUser = await User.findById(req.user.id);
		const likedUser = await User.findById(likedUserId);

		if (!likedUser) {
			return res.status(404).json({
				success: false,
				message: "User not found",
			});
		}

		if (!currentUser.likes.includes(likedUserId)) {
			currentUser.likes.push(likedUserId);
			await currentUser.save();

			// if the other user already liked us, it's a match, so let's update both users
			if (likedUser.likes.includes(currentUser.id)) {
				currentUser.matches.push(likedUserId);
				likedUser.matches.push(currentUser.id);

				await Promise.all([await currentUser.save(), await likedUser.save()]);

				// send notification in real-time with socket.io
				const connectedUsers = getConnectedUsers();
				const io = getIO();

				const likedUserSocketId = connectedUsers.get(likedUserId);

				if (likedUserSocketId) {
					io.to(likedUserSocketId).emit("newMatch", {
						_id: currentUser._id,
						name: currentUser.name,
						profilePhoto: currentUser.profilePhoto,
					});
				}

				const currentSocketId = connectedUsers.get(currentUser._id.toString());
				if (currentSocketId) {
					io.to(currentSocketId).emit("newMatch", {
						_id: likedUser._id,
						name: likedUser.name,
						profilePhoto: likedUser.profilePhoto,
					});
				}
			}
		}

		res.status(200).json({
			success: true,
			user: currentUser,
		});
	} catch (error) {
		console.log("Error in swipeRight: ", error);

		res.status(500).json({
			success: false,
			message: "Internal server error",
		});
	}
};

export const swipeLeft = async (req, res) => {
	try {

		const { dislikedUserId } = req.params;
		console.log("disliked user id", dislikedUserId)
		const currentUser = await User.findById(req.user.id);
		console.log("current user", currentUser)

		if (!currentUser.dislikes.includes(dislikedUserId)) {
			currentUser.dislikes.push(dislikedUserId);
			await currentUser.save();
		}

		res.status(200).json({
			success: true,
			user: currentUser,
		});
	} catch (error) {
		console.log("Error in swipeLeft: ", error);

		res.status(500).json({
			success: false,
			message: "Internal server error",
		});
	}
};

export const getMatches = async (req, res) => {
	try {
		const user = await User.findById(req.user.id).populate("matches", "name profilePhoto");

		res.status(200).json({
			success: true,
			matches: user.matches,
		});
	} catch (error) {
		console.log("Error in getMatches: ", error);

		res.status(500).json({
			success: false,
			message: "Internal server error",
		});
	}
};


export const getLikers = async (req, res) => {
	try {
		const { userId } = req.params;
		console.log("inside this",userId);

		// Fetch the current user
		const currentUser = await User.findById(userId);
		if (!currentUser) {
			return res.status(404).json({ message: "User not found." });
		}

		// Fetch users where the likes array contains the given userId
		let usersWhoLiked = await User.find({ likes: userId });

		console.log("who liked are", usersWhoLiked);

		// Filter out users already in currentUser's likes, dislikes, or matches
		usersWhoLiked = usersWhoLiked.filter(user =>
			!currentUser.likes.includes(user._id.toString()) &&
			!currentUser.dislikes.includes(user._id.toString()) &&
			!currentUser.matches.includes(user._id.toString())
		);

		console.log("who liked are =>", usersWhoLiked);


		if (!usersWhoLiked.length) {
			return res.status(404).json({ message: "No new users have liked this user." });
		}

		res.status(200).json(usersWhoLiked);
	} catch (error) {
		console.error("Error fetching users who liked:", error);
		res.status(500).json({ message: "Internal Server Error" });
	}
};



export const getUserProfiles = async (req, res) => {
	try {
		// Get current user based on authenticated req.user.id
		const currentUser = await User.findById(req.user._id);
		if (!currentUser) {
			return res.status(404).json({ success: false, message: "User not found" });
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
					...(currentUser.matches?.length ? currentUser.matches : [])
				]
			}
		};


		// Filter by gender if the preference is not "any"
		if (
			currentPreference &&
			currentPreference.preferredGender &&
			currentPreference.preferredGender.toLowerCase() !== "any"
		) {
			criteria.gender = currentPreference.preferredGender;
		}



		// Filter by age using birthDate (if minAge and maxAge exist)
		// if (currentPreference && currentPreference.minAge && currentPreference.maxAge) {
		// 	const now = new Date();
		// 	// Earliest acceptable birthDate: user must be at most maxAge years old
		// 	const earliestBirthDate = new Date(now);
		// 	earliestBirthDate.setFullYear(now.getFullYear() - currentPreference.maxAge);

		// 	// Latest acceptable birthDate: user must be at least minAge years old
		// 	const latestBirthDate = new Date(now);
		// 	latestBirthDate.setFullYear(now.getFullYear() - currentPreference.minAge);

		// 	criteria.birthDate = { $gte: earliestBirthDate, $lte: latestBirthDate };
		// }

		// const user3 = await User.find(criteria);
		// console.log("users found step 3", user3);


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
		const users = await User.find(criteria);

		res.status(200).json({
			success: true,
			users,
		});
	} catch (error) {
		console.log("Error in getUserProfiles: ", error);
		res.status(500).json({
			success: false,
			message: "Internal server error",
		});
	}
};
