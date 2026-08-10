import Preference from "../models/Preference.js";
import { ForbiddenError, NotFoundError } from "../utils/AppError.js";

export const save = async (req, res) => {
	const preference = new Preference(req.body);
	const savedPreference = await preference.save();
	res.status(201).json(savedPreference);
};

export const findAll = async (req, res) => {
	const preferences = await Preference.find().populate(["userId"]);
	res.status(200).json(preferences);
};

export const findById = async (req, res) => {
	const { id } = req.params;
	const preference = await Preference.findById(id).populate("userId", "name email");
	if (!preference) throw new NotFoundError("Preferences not found");
	res.status(200).json(preference);
};

export const deleteById = async (req, res) => {
	const { id } = req.params;
	const deletedPreference = await Preference.findByIdAndDelete(id);
	if (!deletedPreference) throw new NotFoundError("Preferences not found");
	res.status(200).json({ message: "Preferences deleted successfully" });
};

export const update = async (req, res) => {
	const { id } = req.params;
	const { preferredGender, minAge, maxAge, relationType, preferredStarSign, preferredReligion } = req.body;
	const updatedPreference = await Preference.findByIdAndUpdate(
		id,
		{ preferredGender, minAge, maxAge, relationType, preferredStarSign, preferredReligion },
		{ new: true, runValidators: true }
	);
	if (!updatedPreference) throw new NotFoundError("Preferences not found");
	res.status(200).json(updatedPreference);
};

export const findPreferenceByUserId = async (req, res) => {
	if (req.params.id !== req.user.id) {
		throw new ForbiddenError();
	}

	let preference = await Preference.findOne({ userId: req.params.id });

	if (!preference) {
		preference = await Preference.create({
			userId: req.params.id,
			applyFilter: false,
			preferredGender: "any",
			minAge: 16,
			maxAge: 60,
			relationType: "any",
			preferredStarSign: "any",
			preferredReligion: "any",
		});
	}

	res.status(200).json(preference);
};

export const updatePreferenceByUserId = async (req, res) => {
	const userId = req.params.id;

	if (userId !== req.user.id) {
		throw new ForbiddenError();
	}

	const { preferredGender, minAge, maxAge, relationType, preferredStarSign, preferredReligion } = req.body;

	const updatedPreference = await Preference.findOneAndUpdate(
		{ userId },
		{ preferredGender, minAge, maxAge, relationType, preferredStarSign, preferredReligion },
		{ new: true, runValidators: true }
	);

	if (!updatedPreference) throw new NotFoundError("Preference not found");

	res.status(200).json(updatedPreference);
};
