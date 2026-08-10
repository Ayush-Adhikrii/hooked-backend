import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import Message from "../models/Message.js";
import Photos from "../models/Photos.js";
import Preference from "../models/Preference.js";
import Subscription from "../models/Subscription.js";
import User from "../models/User.js";
import UserDetails from "../models/UserDetails.js";
import { BadRequestError, ForbiddenError, NotFoundError, UnauthorizedError } from "../utils/AppError.js";

const signToken = (id) => {
	return jwt.sign({ id }, process.env.JWT_SECRET, {
		expiresIn: "7d",
	});
};

const setAuthCookie = (res, token) => {
	res.cookie("jwt", token, {
		maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
		httpOnly: true,
		sameSite: "lax",
		secure: process.env.NODE_ENV === "production",
	});
};

export const findAll = async (req, res) => {
	const users = await User.find();
	res.status(200).json({ success: true, count: users.length, data: users });
};

export const findById = async (req, res) => {
	const user = await User.findById(req.params.id);
	if (!user) throw new NotFoundError(`User not found with id ${req.params.id}`);
	res.status(200).json({ success: true, data: user });
};

export const uploadImage = async (req, res) => {
	if (!req.file) {
		throw new BadRequestError("Please upload a file");
	}
	res.status(200).json({
		success: true,
		data: req.file.filename,
	});
};

export const signup = async (req, res) => {
	const { name, email, phoneNumber, userName, password, gender, birthDate, starSign, bio, profilePhoto } = req.body;

	const existingUser = await User.findOne({ userName });
	if (existingUser) {
		throw new BadRequestError("User already exists");
	}

	const hashedPassword = await bcrypt.hash(password, 10);

	const newUser = await User.create({
		name,
		email,
		phoneNumber,
		userName,
		password: hashedPassword,
		gender,
		birthDate,
		starSign,
		bio,
		profilePhoto: profilePhoto || "default_profile.png",
	});

	const token = signToken(newUser._id);
	setAuthCookie(res, token);

	res.status(201).json({
		success: true,
		message: "User registered successfully",
		user: {
			_id: newUser._id,
			name: newUser.name,
			gender: newUser.gender,
			email: newUser.email,
			birthDate: newUser.birthDate,
			starSign: newUser.starSign,
			bio: newUser.bio,
			phoneNumber: newUser.phoneNumber,
			userName: newUser.userName,
			profilePhoto: newUser.profilePhoto,
		},
	});
};

export const login = async (req, res) => {
	const { userName, password } = req.body;

	const user = await User.findOne({ userName });
	if (!user) {
		throw new BadRequestError("Invalid credentials");
	}

	const isPasswordCorrect = await bcrypt.compare(password, user.password);
	if (!isPasswordCorrect) {
		throw new UnauthorizedError("Invalid credentials");
	}

	const token = signToken(user._id);
	setAuthCookie(res, token);

	res.status(200).json({
		success: true,
		token,
		user,
	});
};

export const logout = (req, res) => {
	res.cookie("jwt", "", { maxAge: 0 });
	res.status(200).json({ message: "Logged out successfully" });
};

export const update = async (req, res) => {
	if (req.params.id !== req.user.id) {
		throw new ForbiddenError("You can only update your own profile");
	}

	const user = await User.findById(req.params.id);
	if (!user) throw new NotFoundError("User not found");

	delete req.body._id;
	delete req.body.likes;
	delete req.body.dislikes;
	delete req.body.matches;

	if (req.body.password) {
		req.body.password = await bcrypt.hash(req.body.password, 10);
	}

	const updatedUser = await User.findByIdAndUpdate(req.params.id, req.body, {
		new: true,
		runValidators: true,
	});

	res.status(200).json({
		success: true,
		message: "User updated successfully",
		data: updatedUser,
	});
};

export const checkPassword = async (req, res) => {
	const { userId, password } = req.body;

	if (userId !== req.user.id) {
		throw new ForbiddenError();
	}

	const user = await User.findById(userId);
	if (!user) throw new NotFoundError("User not found");

	const isPasswordSame = await bcrypt.compare(password, user.password);
	if (!isPasswordSame) {
		return res.status(401).json({ success: false, message: "Invalid Password" });
	}
	res.status(200).json({ success: true, message: "The password is Correct" });
};

export const changePassword = async (req, res) => {
	const { userId, password } = req.body;

	if (userId !== req.user.id) {
		throw new ForbiddenError();
	}

	const user = await User.findById(userId);
	if (!user) throw new NotFoundError("User not found");

	const isPasswordSame = await bcrypt.compare(password, user.password);
	if (isPasswordSame) {
		throw new BadRequestError("New password cannot be the same as the old password");
	}

	const hashedPassword = await bcrypt.hash(password, 10);
	const updatedUser = await User.findByIdAndUpdate(
		userId,
		{ password: hashedPassword },
		{ new: true, runValidators: true }
	);

	res.status(200).json({
		success: true,
		message: "Password updated successfully",
		data: updatedUser,
	});
};

// Deletes the caller's own account and cleans up everything that references
// it, rather than leaving Photos/Preference/Subscription/UserDetails/Message
// documents (and other users' likes/dislikes/matches arrays) pointing at a
// user that no longer exists.
export const deleteMyAccount = async (req, res) => {
	const userId = req.user.id;

	await Promise.all([
		Photos.deleteMany({ userId }),
		Preference.deleteMany({ userId }),
		Subscription.deleteMany({ userId }),
		UserDetails.deleteMany({ userId }),
		Message.deleteMany({ $or: [{ sender: userId }, { receiver: userId }] }),
		User.updateMany(
			{ $or: [{ likes: userId }, { dislikes: userId }, { matches: userId }] },
			{ $pull: { likes: userId, dislikes: userId, matches: userId } }
		),
	]);

	await User.findByIdAndDelete(userId);

	res.cookie("jwt", "", { maxAge: 0 });
	res.status(200).json({ success: true, message: "Account deleted successfully" });
};
