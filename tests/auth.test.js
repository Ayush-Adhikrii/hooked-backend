import request from "supertest";
import { beforeEach, describe, expect, it } from "vitest";
import Message from "../models/Message.js";
import Photos from "../models/Photos.js";
import Preference from "../models/Preference.js";
import Subscription from "../models/Subscription.js";
import User from "../models/User.js";
import { app, signupAndLogin, signupPayload } from "./helpers.js";

describe("POST /api/auth/signup", () => {
	it("creates a user and never returns the password", async () => {
		const res = await request(app).post("/api/auth/signup").send(signupPayload());

		expect(res.status).toBe(201);
		expect(res.body.user.password).toBeUndefined();
		expect(res.headers["set-cookie"][0]).toMatch(/^jwt=/);
	});

	it("rejects a duplicate username", async () => {
		const payload = signupPayload();
		await request(app).post("/api/auth/signup").send(payload);

		const res = await request(app).post("/api/auth/signup").send(payload);
		expect(res.status).toBe(400);
	});

	it("rejects a password under 6 characters", async () => {
		const res = await request(app)
			.post("/api/auth/signup")
			.send(signupPayload({ password: "123" }));
		expect(res.status).toBe(400);
	});

	it("rejects a signup missing a required field", async () => {
		const payload = signupPayload();
		delete payload.name;
		const res = await request(app).post("/api/auth/signup").send(payload);
		expect(res.status).toBe(400);
	});
});

describe("POST /api/auth/login", () => {
	it("logs in with correct credentials", async () => {
		const { payload } = await signupAndLogin();
		const res = await request(app)
			.post("/api/auth/login")
			.send({ userName: payload.userName, password: payload.password });
		expect(res.status).toBe(200);
		expect(res.body.user.userName).toBe(payload.userName);
	});

	it("rejects the wrong password", async () => {
		const { payload } = await signupAndLogin();
		const res = await request(app)
			.post("/api/auth/login")
			.send({ userName: payload.userName, password: "wrongpassword" });
		expect(res.status).toBe(401);
	});

	it("rejects an unknown username", async () => {
		const res = await request(app).post("/api/auth/login").send({ userName: "nobody_here", password: "password123" });
		expect(res.status).toBe(400);
	});
});

describe("GET /api/auth/me", () => {
	it("requires authentication", async () => {
		const res = await request(app).get("/api/auth/me");
		expect(res.status).toBe(401);
	});

	it("returns the current user when authenticated", async () => {
		const { agent, user } = await signupAndLogin();
		const res = await agent.get("/api/auth/me");
		expect(res.status).toBe(200);
		expect(res.body.user._id).toBe(user._id);
	});
});

describe("ownership checks", () => {
	it("blocks updating another user's profile", async () => {
		const { agent } = await signupAndLogin();
		const { user: otherUser } = await signupAndLogin();

		const res = await agent.put(`/api/auth/update/${otherUser._id}`).send({ bio: "hacked" });
		expect(res.status).toBe(403);
	});

	it("allows updating your own profile", async () => {
		const { agent, user } = await signupAndLogin();
		const res = await agent.put(`/api/auth/update/${user._id}`).send({ bio: "updated bio" });
		expect(res.status).toBe(200);
		expect(res.body.data.bio).toBe("updated bio");
	});

	it("blocks an unauthenticated profile update entirely", async () => {
		const { user } = await signupAndLogin();
		const res = await request(app).put(`/api/auth/update/${user._id}`).send({ password: "takeover123" });
		expect(res.status).toBe(401);
	});

	it("blocks checking another user's password", async () => {
		const { agent } = await signupAndLogin();
		const { user: otherUser, payload: otherPayload } = await signupAndLogin();

		const res = await agent
			.post("/api/auth/checkPassword")
			.send({ userId: otherUser._id, password: otherPayload.password });
		expect(res.status).toBe(403);
	});

	it("confirms your own correct password", async () => {
		const { agent, user, payload } = await signupAndLogin();
		const res = await agent.post("/api/auth/checkPassword").send({ userId: user._id, password: payload.password });
		expect(res.status).toBe(200);
		expect(res.body.success).toBe(true);
	});
});

describe("DELETE /api/auth/me", () => {
	it("deletes the account and cascades to related data", async () => {
		const { agent: agentA, user: userA } = await signupAndLogin();
		const { agent: agentB, user: userB } = await signupAndLogin();

		// A and B match, then create related data for A
		await agentA.post(`/api/matches/swipe-right/${userB._id}`);
		await agentB.post(`/api/matches/swipe-right/${userA._id}`);
		await agentA.post("/api/messages/send").send({ receiverId: userB._id, content: "hi" });
		await agentA.get(`/api/preference/${userA._id}`);
		await agentA.post("/api/subscription").send({
			userId: userA._id,
			subscriptionType: "Gold",
			subscribedOn: new Date().toISOString(),
			expiresOn: new Date().toISOString(),
		});

		const res = await agentA.delete("/api/auth/me");
		expect(res.status).toBe(200);

		expect(await User.findById(userA._id)).toBeNull();
		expect(await Preference.countDocuments({ userId: userA._id })).toBe(0);
		expect(await Subscription.countDocuments({ userId: userA._id })).toBe(0);
		expect(await Photos.countDocuments({ userId: userA._id })).toBe(0);
		expect(await Message.countDocuments({ $or: [{ sender: userA._id }, { receiver: userA._id }] })).toBe(0);

		const remainingB = await User.findById(userB._id);
		expect(remainingB.matches.map(String)).not.toContain(userA._id);
	});
});
