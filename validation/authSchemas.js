import { z } from "zod";

export const signupSchema = z.object({
	name: z.string().trim().min(1, "Name is required"),
	userName: z.string().trim().min(1, "Username is required"),
	password: z.string().min(6, "Password must be at least 6 characters"),
	email: z.string().trim().email("Invalid email").optional().or(z.literal("")),
	phoneNumber: z.string().trim().optional(),
	gender: z.enum(["Male", "Female", "Other"]).optional(),
	birthDate: z.string().optional(),
	starSign: z.string().optional(),
	bio: z.string().max(500).optional(),
	profilePhoto: z.string().optional(),
});

export const loginSchema = z.object({
	userName: z.string().trim().min(1, "Username is required"),
	password: z.string().min(1, "Password is required"),
});

export const updateProfileSchema = z.object({
	name: z.string().trim().min(1).optional(),
	userName: z.string().trim().min(1).optional(),
	password: z.string().min(6, "Password must be at least 6 characters").optional(),
	email: z.string().trim().email("Invalid email").optional().or(z.literal("")),
	phoneNumber: z.string().trim().optional(),
	gender: z.enum(["Male", "Female", "Other"]).optional(),
	birthDate: z.string().optional(),
	starSign: z.string().optional(),
	bio: z.string().max(500).optional(),
	profilePhoto: z.string().optional(),
});
