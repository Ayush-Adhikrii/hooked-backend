import Photos from "../models/Photos.js";
import { BadRequestError, ForbiddenError, NotFoundError } from "../utils/AppError.js";
import { uploadBufferToCloudinary } from "../utils/uploadToCloudinary.js";

const MAX_PHOTOS_PER_USER = 4;

export const findAll = async (req, res) => {
	const photos = await Photos.find();
	res.status(200).json(photos);
};

export const uploadPhoto = async (req, res) => {
	if (!req.file) {
		throw new BadRequestError("Please upload a file");
	}
	const result = await uploadBufferToCloudinary(req.file.buffer, "hooked/userImages");
	res.status(200).json({
		success: true,
		data: result.secure_url,
	});
};

export const savePhoto = async (req, res) => {
	const { userId, image } = req.body;

	if (userId !== req.user.id) {
		throw new ForbiddenError();
	}
	if (!image) {
		throw new BadRequestError("image is required");
	}

	const existingCount = await Photos.countDocuments({ userId });
	if (existingCount >= MAX_PHOTOS_PER_USER) {
		throw new BadRequestError(`You can only have up to ${MAX_PHOTOS_PER_USER} photos`);
	}

	const newPhoto = await Photos.create({ userId, image });

	res.status(201).json({
		success: true,
		message: "Photo uploaded successfully",
		user: {
			_id: newPhoto._id,
			userId: newPhoto.userId,
			image: newPhoto.image,
		},
	});
};

export const findById = async (req, res) => {
	const photo = await Photos.findById(req.params.id);
	if (!photo) throw new NotFoundError();
	res.status(200).json(photo);
};

export const findPhotosByUserId = async (req, res) => {
	const userId = req.params.userId;
	let photos = await Photos.find({ userId }).sort({ _id: -1 });

	if (!photos || photos.length === 0) {
		await Photos.create({ userId });
		photos = await Photos.find({ userId }).sort({ _id: -1 });
	}

	const recentPhotos = photos.slice(0, MAX_PHOTOS_PER_USER + 1).map((photo) => photo.image);
	res.status(200).json(recentPhotos);
};

export const deleteById = async (req, res) => {
	const photo = await Photos.findByIdAndDelete(req.params.id);
	if (!photo) throw new NotFoundError();
	res.status(200).json(photo);
};

export const update = async (req, res) => {
	const updatedPhoto = await Photos.findByIdAndUpdate(req.params.id, req.body, {
		new: true,
		runValidators: true,
	});
	if (!updatedPhoto) throw new NotFoundError();
	res.status(200).json(updatedPhoto);
};
