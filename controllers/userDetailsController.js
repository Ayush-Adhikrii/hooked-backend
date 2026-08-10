import UserDetails from "../models/UserDetails.js";
import { ForbiddenError, NotFoundError } from "../utils/AppError.js";

export const findAll = async (req, res) => {
	const userDetails = await UserDetails.find().populate(["userId"]);
	res.status(200).json(userDetails);
};

export const saveDetails = async (req, res) => {
	const userDetail = new UserDetails(req.body);
	const savedUserDetail = await userDetail.save();
	res.status(201).json(savedUserDetail);
};

export const findById = async (req, res) => {
	const userDetail = await UserDetails.findById(req.params.id);
	if (!userDetail) throw new NotFoundError("userDetail not found");
	res.status(200).json(userDetail);
};

// Find a userDetail by User ID, or create it if it doesn't exist
export const findByUserId = async (req, res) => {
	const userId = req.params.id;

	let userDetail = await UserDetails.findOne({ userId });
	if (!userDetail) {
		userDetail = await UserDetails.create({ userId });
		return res.status(201).json(userDetail);
	}

	res.status(200).json(userDetail);
};

export const deleteById = async (req, res) => {
	const userDetail = await UserDetails.findByIdAndDelete(req.params.id);
	if (!userDetail) throw new NotFoundError("userDetail not found");
	res.status(200).json({ message: "userDetail deleted successfully", userDetail });
};

export const update = async (req, res) => {
	const userId = req.params.id;

	if (userId !== req.user.id) {
		throw new ForbiddenError();
	}

	const updatedUserDetail = await UserDetails.findOneAndUpdate({ userId }, req.body, {
		new: true,
		runValidators: true,
	});

	if (!updatedUserDetail) throw new NotFoundError("userDetail not found for this userId");

	res.status(200).json(updatedUserDetail);
};

export const findDetail = async (req, res) => {
	const userId = req.user._id;

	let userDetail = await UserDetails.findOne({ userId });
	if (!userDetail) {
		userDetail = await UserDetails.create({ userId });
		return res.status(201).json(userDetail);
	}

	res.status(200).json(userDetail);
};

export const updateDetail = async (req, res) => {
	const userId = req.user._id;

	const updatedUserDetail = await UserDetails.findOneAndUpdate({ userId }, req.body, {
		new: true,
		runValidators: true,
	});

	if (!updatedUserDetail) throw new NotFoundError("userDetail not found for this userId");

	res.status(200).json(updatedUserDetail);
};
