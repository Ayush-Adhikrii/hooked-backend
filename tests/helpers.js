import request from "supertest";
import app from "../app.js";

let counter = 0;
export const uniqueUserName = (prefix = "user") => `${prefix}_${Date.now()}_${counter++}`;

export const signupPayload = (overrides = {}) => ({
	name: "Test User",
	userName: uniqueUserName(),
	password: "password123",
	gender: "Male",
	birthDate: "1997-01-01",
	...overrides,
});

// Returns a cookie-persisting agent already signed up and logged in, plus
// the created user's id and raw payload.
export const signupAndLogin = async (overrides = {}) => {
	const agent = request.agent(app);
	const payload = signupPayload(overrides);
	const res = await agent.post("/api/auth/signup").send(payload);
	return { agent, user: res.body.user, payload, res };
};

export { app };
