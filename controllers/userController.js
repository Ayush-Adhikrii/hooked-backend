import User from "../models/User.js";

export const updateProfile = async (req, res) => {

	try {
		const { image, ...otherData } = req.body;

		let updatedData = otherData;



		const updatedUser = await User.findByIdAndUpdate(req.user.id, updatedData, { new: true });

		res.status(200).json({
			success: true,
			user: updatedUser,
		});
	} catch (error) {
		console.log("Error in updateProfile: ", error);
		res.status(500).json({
			success: false,
			message: "Internal server error",
		});
	}
};
