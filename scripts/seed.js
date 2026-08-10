// Wipes every collection this app owns and replaces it with a small, fully
// filled-in dummy dataset - 5 male (m1-m5.png) and 5 female (f1-f5.png)
// profiles, matching whatever images get dropped into public/profilePhotos
// and public/userImages under those exact names.
//
// Run with: npm run seed

import bcrypt from "bcryptjs";
import dotenv from "dotenv";
import mongoose from "mongoose";

import Message from "../models/Message.js";
import Photos from "../models/Photos.js";
import Preference from "../models/Preference.js";
import Subscription from "../models/Subscription.js";
import User from "../models/User.js";
import UserDetails from "../models/UserDetails.js";

dotenv.config();

const SHARED_PASSWORD = "password123";

const DUMMY_PROFILES = [
	{
		name: "Aarav Sharma",
		userName: "aarav_sharma",
		email: "aarav.sharma@example.com",
		phoneNumber: "9841000001",
		gender: "Male",
		birthDate: "1997-03-15",
		starSign: "Pisces",
		bio: "Software engineer who debugs by day and boulders by weekend.",
		profilePhoto: "m1.png",
		details: {
			profession: "Software Engineer",
			education: "Bachelor's in Computer Engineering",
			height: 175,
			exercise: "Regularly",
			drinks: "Social drinker",
			smoke: "Never",
			kids: "Don't want any",
			religion: "Hindu",
		},
	},
	{
		name: "Bishal Thapa",
		userName: "bishal_thapa",
		email: "bishal.thapa@example.com",
		phoneNumber: "9841000002",
		gender: "Male",
		birthDate: "1995-07-22",
		starSign: "Cancer",
		bio: "Civil engineer, terrible cook, great at finding the best momo spots.",
		profilePhoto: "m2.png",
		details: {
			profession: "Civil Engineer",
			education: "Bachelor's in Civil Engineering",
			height: 172,
			exercise: "Sometimes",
			drinks: "Never",
			smoke: "Never",
			kids: "Want to have",
			religion: "Buddhist",
		},
	},
	{
		name: "Nabin Gurung",
		userName: "nabin_gurung",
		email: "nabin.gurung@example.com",
		phoneNumber: "9841000003",
		gender: "Male",
		birthDate: "1999-11-05",
		starSign: "Scorpio",
		bio: "Photographer chasing golden hour around the valley.",
		profilePhoto: "m3.png",
		details: {
			profession: "Photographer",
			education: "Bachelor's in Fine Arts",
			height: 178,
			exercise: "Regularly",
			drinks: "Sometimes",
			smoke: "Only while drinking",
			kids: "Don't want any",
			religion: "Buddhist",
		},
	},
	{
		name: "Prakash Rai",
		userName: "prakash_rai",
		email: "prakash.rai@example.com",
		phoneNumber: "9841000004",
		gender: "Male",
		birthDate: "1993-01-30",
		starSign: "Aquarius",
		bio: "Doctor on call, always down for a quiet dinner when off.",
		profilePhoto: "m4.png",
		details: {
			profession: "Doctor",
			education: "MBBS",
			height: 168,
			exercise: "Try to but I fail",
			drinks: "Never",
			smoke: "Never",
			kids: "I already have",
			religion: "Hindu",
		},
	},
	{
		name: "Sujan Karki",
		userName: "sujan_karki",
		email: "sujan.karki@example.com",
		phoneNumber: "9841000005",
		gender: "Male",
		birthDate: "1998-09-18",
		starSign: "Virgo",
		bio: "Chef. I will absolutely cook for you on the second date.",
		profilePhoto: "m5.png",
		details: {
			profession: "Chef",
			education: "Culinary Diploma",
			height: 180,
			exercise: "Regularly",
			drinks: "Social drinker",
			smoke: "Never",
			kids: "Want to have",
			religion: "Hindu",
		},
	},
	{
		name: "Aastha Adhikari",
		userName: "aastha_adhikari",
		email: "aastha.adhikari@example.com",
		phoneNumber: "9851000001",
		gender: "Female",
		birthDate: "1998-04-12",
		starSign: "Aries",
		bio: "Graphic designer, plant mom, professional playlist curator.",
		profilePhoto: "f1.png",
		details: {
			profession: "Graphic Designer",
			education: "Bachelor's in Design",
			height: 160,
			exercise: "Sometimes",
			drinks: "Never",
			smoke: "Never",
			kids: "Don't want any",
			religion: "Hindu",
		},
	},
	{
		name: "Bibisha Shrestha",
		userName: "bibisha_shrestha",
		email: "bibisha.shrestha@example.com",
		phoneNumber: "9851000002",
		gender: "Female",
		birthDate: "1996-06-25",
		starSign: "Cancer",
		bio: "Marketing manager who takes trivia night very seriously.",
		profilePhoto: "f2.png",
		details: {
			profession: "Marketing Manager",
			education: "MBA",
			height: 163,
			exercise: "Regularly",
			drinks: "Social drinker",
			smoke: "Never",
			kids: "Want to have",
			religion: "Buddhist",
		},
	},
	{
		name: "Kripa Basnet",
		userName: "kripa_basnet",
		email: "kripa.basnet@example.com",
		phoneNumber: "9851000003",
		gender: "Female",
		birthDate: "2000-12-02",
		starSign: "Sagittarius",
		bio: "Journalist. Ask me about the last story I chased.",
		profilePhoto: "f3.png",
		details: {
			profession: "Journalist",
			education: "Bachelor's in Mass Communication",
			height: 158,
			exercise: "Sometimes",
			drinks: "Sometimes",
			smoke: "Never",
			kids: "Don't want any",
			religion: "Hindu",
		},
	},
	{
		name: "Manisha Tamang",
		userName: "manisha_tamang",
		email: "manisha.tamang@example.com",
		phoneNumber: "9851000004",
		gender: "Female",
		birthDate: "1994-08-09",
		starSign: "Leo",
		bio: "Architect. I will judge your apartment's floor plan, kindly.",
		profilePhoto: "f4.png",
		details: {
			profession: "Architect",
			education: "Bachelor's in Architecture",
			height: 165,
			exercise: "Regularly",
			drinks: "Never",
			smoke: "Never",
			kids: "I already have",
			religion: "Buddhist",
		},
	},
	{
		name: "Sneha Poudel",
		userName: "sneha_poudel",
		email: "sneha.poudel@example.com",
		phoneNumber: "9851000005",
		gender: "Female",
		birthDate: "1999-02-14",
		starSign: "Aquarius",
		bio: "Nurse. Ask me anything except to look at your weird rash.",
		profilePhoto: "f5.png",
		details: {
			profession: "Nurse",
			education: "Bachelor's in Nursing",
			height: 162,
			exercise: "Try to but I fail",
			drinks: "Never",
			smoke: "Never",
			kids: "Want to have",
			religion: "Hindu",
		},
	},
];

const seed = async () => {
	await mongoose.connect(process.env.MONGO_URI);
	console.log("Connected to", mongoose.connection.name);

	const [users, messages, photos, preferences, subscriptions, userDetails] = await Promise.all([
		User.countDocuments(),
		Message.countDocuments(),
		Photos.countDocuments(),
		Preference.countDocuments(),
		Subscription.countDocuments(),
		UserDetails.countDocuments(),
	]);
	console.log(
		`Deleting existing data: ${users} users, ${messages} messages, ${photos} photos, ${preferences} preferences, ${subscriptions} subscriptions, ${userDetails} userDetails`
	);

	await Promise.all([
		User.deleteMany({}),
		Message.deleteMany({}),
		Photos.deleteMany({}),
		Preference.deleteMany({}),
		Subscription.deleteMany({}),
		UserDetails.deleteMany({}),
	]);

	const hashedPassword = await bcrypt.hash(SHARED_PASSWORD, 10);

	for (const profile of DUMMY_PROFILES) {
		const user = await User.create({
			name: profile.name,
			userName: profile.userName,
			email: profile.email,
			phoneNumber: profile.phoneNumber,
			password: hashedPassword,
			gender: profile.gender,
			birthDate: profile.birthDate,
			starSign: profile.starSign,
			bio: profile.bio,
			profilePhoto: profile.profilePhoto,
		});

		await UserDetails.create({ userId: user._id, ...profile.details });

		// Reuses the same filename as the profile photo, per the images being
		// dropped into both public/profilePhotos and public/userImages.
		await Photos.create({ userId: user._id, image: profile.profilePhoto });

		console.log(`Created ${profile.gender === "Male" ? "M" : "F"} ${user.userName} (${user._id})`);
	}

	console.log(`\nSeeded ${DUMMY_PROFILES.length} users. Shared password for all: "${SHARED_PASSWORD}"`);
	await mongoose.disconnect();
};

seed().catch((error) => {
	console.error("Seeding failed:", error);
	process.exit(1);
});
