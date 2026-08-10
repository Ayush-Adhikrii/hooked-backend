import rateLimit from "express-rate-limit";

// Login/signup/password-check endpoints are the ones worth brute-forcing -
// keep them tight. Everything else rides the default Express behavior.
export const authLimiter = rateLimit({
	windowMs: 15 * 60 * 1000,
	limit: 20,
	standardHeaders: true,
	legacyHeaders: false,
	// The test suite legitimately makes many auth calls in quick succession -
	// only the real dev/prod runtime needs the limit enforced.
	skip: () => process.env.NODE_ENV === "test",
	message: { success: false, message: "Too many attempts, please try again later" },
});
