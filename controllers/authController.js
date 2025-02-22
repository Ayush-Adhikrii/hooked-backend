import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import User from "../models/User.js";



const signToken = (id) => {
	// jwt token
	return jwt.sign({ id }, process.env.JWT_SECRET, {
		expiresIn: "7d",
	});
};

export const findAll = async (req, res) => {
	const users = await User.find();
	res.status(200).json({ success: true, count: users.length, data: users });
};

export const findById = async (req, res) => {
	const user = await User.findById(req.id);
	if (!user) return res.status(404).json({ message: `User not found with id ${req.params.id}` });
	res.status(200).json({ success: true, data: user });
};


export const uploadImage = async (req, res, next) => {
	console.log("POST /api/auth/uploadImage called");
	console.log("Request file:", req.profilePicture);


	if (!req.file) {
		return res.status(400).send({ message: "Please upload a file" });
	}
	res.status(200).json({
		success: true,
		data: req.file.filename,
	});
};


export const signup = async (req, res) => {
	console.log("POST /api/user called");
	console.log("Request body and the pw isnt hashed:", req.body);
	console.log("checkpoint");

	try {
		const {
			name,
			email,
			phoneNumber,
			userName,
			password,
			gender,
			birthDate,
			starSign,
			bio,
			profilePhoto,
		} = req.body;

		// Check if a user with the same username already exists
		const existingUser = await User.findOne({ userName });
		if (existingUser) {
			return res.status(400).json({ message: "User already exists" });
		}

		let userProfilePhoto = profilePhoto || "default_profile.png";

		// Hash the password before storing it
		const saltRounds = 10;
		const hashedPassword = await bcrypt.hash(password, saltRounds);

		// Create the new user document
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
			profilePhoto: userProfilePhoto,
		});
		console.log("New user created: in api", newUser);

		if (newUser) {
			// Generate a JWT token containing every field except the password.
			const token = signToken(newUser._id);

			res.cookie("jwt", token, {
				maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days in milliseconds
				httpOnly: true, // prevents XSS attacks
				sameSite: "strict", // prevents CSRF attacks
				secure: process.env.NODE_ENV === "production",
			});

			return res.status(201).json({
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
		} else {
			return res.status(400).json({ message: "Invalid user data" });
		}
	} catch (error) {
		console.error("Error saving user:", error);
		return res.status(500).json({
			message: "Internal server error",
			error: error.message,
		});
	}
};




export const login = async (req, res) => {
	const { userName, password } = req.body;
	console.log(req.body);
	try {
		console.log("POST /api/auth/login called");
		const user = await User.findOne({ userName });
		console.log("User found:", user ? user.userName : "Not Found");

		if (!user) {
			return res.status(400).json({ message: "Invalid credentials" });
		}

		const isPasswordCorrect = await bcrypt.compare(password, user.password);
		console.log("Password provided:", password);
		console.log("Password match:", isPasswordCorrect);

		if (!isPasswordCorrect) {
			return res.json({ message: "Invalid credentials" });
		}

		const token = signToken(user._id);

		res.cookie("jwt", token, {
			maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days in milliseconds
			httpOnly: true, // prevents XSS attacks
			sameSite: "strict", // prevents CSRF attacks
			secure: process.env.NODE_ENV === "production",
		});

		res.status(200).json({
			success: true,
			user,
		});
	} catch (error) {
		console.log("Error in login controller", error.message);
		res.status(500).json({ message: "Internal Server Error" });
	}
};


export const logout = (req, res) => {
	try {
		res.cookie("jwt", "", { maxAge: 0 });
		res.status(200).json({ message: "Logged out successfully" });
	} catch (error) {
		console.log("Error in logout controller", error.message);
		res.status(500).json({ message: "Internal Server Error" });
	}
};


export const update = async (req, res) => {
	console.log("PUT /api/user/:id called");
	try {
		const user = await User.findById(req.params.id);
		if (!user) return res.status(404).json({ message: "User not found" });

		// if (req.file) {
		// 	const oldImagePath = path.join(__dirname, "..", "profilePictures", user.profilePhoto);
		// 	if (fs.existsSync(oldImagePath)) fs.unlinkSync(oldImagePath);
		// }

		if (req.body.password) {
			const salt = await bcrypt.genSalt(10);
			req.body.password = await bcrypt.hash(req.body.password, salt);
		}

		const updatedUser = await User.findByIdAndUpdate(
			req.params.id,
			{ ...req.body, profilePhoto: req.file ? req.file.filename : user.profilePhoto },
			{ new: true, runValidators: true }
		);

		res.status(200).json({
			success: true,
			message: "User updated successfully",
			data: updatedUser,
		});
	} catch (error) {
		console.error("Error updating user:", error);
		res.status(500).json({ message: "Internal server error", error });
	}
};



export const changePassword = async (req, res) => {
	const { userId, password } = req.body;
	console.log("Change Password API called for user:", userId);

	try {
		const user = await User.findById(userId);

		if (!user) {
			console.log("User not found");
			return res.status(404).json({ message: "User not found" });
		}

		// Check if the new password is the same as the old password
		const isPasswordSame = await bcrypt.compare(password, user.password);

		console.log("Provided Password:", password);
		console.log("Is password the same:", isPasswordSame);

		if (isPasswordSame) {
			return res.status(400).json({ message: "New password cannot be the same as the old password" });
		}

		// Hash new password
		const salt = await bcrypt.genSalt(10);
		const hashedPassword = await bcrypt.hash(password, salt);

		// Update user password
		const updatedUser = await User.findByIdAndUpdate(
			userId,
			{ password: hashedPassword },
			{ new: true, runValidators: true }
		);

		console.log("Password successfully updated for user:", userId);

		res.status(200).json({
			success: true,
			message: "Password updated successfully",
			data: updatedUser,
		});
	} catch (error) {
		console.error("Error updating password:", error);
		res.status(500).json({ message: "Internal server error", error });
	}
};
