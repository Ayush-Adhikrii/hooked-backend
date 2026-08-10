import request from "supertest";
import { describe, expect, it } from "vitest";
import { app, signupAndLogin } from "./helpers.js";

describe("GET /api/matches/user-profiles", () => {
	it("requires authentication", async () => {
		const res = await request(app).get("/api/matches/user-profiles");
		expect(res.status).toBe(401);
	});

	it("excludes the caller from their own discovery feed", async () => {
		const { agent, user } = await signupAndLogin();
		const res = await agent.get("/api/matches/user-profiles");
		expect(res.status).toBe(200);
		expect(res.body.users.map((u) => u._id)).not.toContain(user._id);
	});

	it("includes pagination metadata", async () => {
		const { agent } = await signupAndLogin();
		const res = await agent.get("/api/matches/user-profiles");
		expect(res.body).toMatchObject({
			page: 1,
			limit: expect.any(Number),
			total: expect.any(Number),
			hasMore: expect.any(Boolean),
		});
	});
});

describe("swiping and matching", () => {
	it("does not match on a one-directional like", async () => {
		const { agent: agentA } = await signupAndLogin();
		const { user: userB } = await signupAndLogin();

		const res = await agentA.post(`/api/matches/swipe-right/${userB._id}`);
		expect(res.status).toBe(200);

		const matches = await agentA.get("/api/matches");
		expect(matches.body.matches).toHaveLength(0);
	});

	it("creates a mutual match when both users swipe right on each other", async () => {
		const { agent: agentA, user: userA } = await signupAndLogin();
		const { agent: agentB, user: userB } = await signupAndLogin();

		await agentA.post(`/api/matches/swipe-right/${userB._id}`);
		await agentB.post(`/api/matches/swipe-right/${userA._id}`);

		const matchesA = await agentA.get("/api/matches");
		const matchesB = await agentB.get("/api/matches");

		expect(matchesA.body.matches.map((m) => m._id)).toContain(userB._id);
		expect(matchesB.body.matches.map((m) => m._id)).toContain(userA._id);
	});

	it("rejects swiping on yourself", async () => {
		const { agent, user } = await signupAndLogin();
		const res = await agent.post(`/api/matches/swipe-right/${user._id}`);
		expect(res.status).toBe(403);
	});
});

describe("GET /api/matches sort order", () => {
	it("sorts matches by most recent message, with un-messaged matches last", async () => {
		const { agent: agentA, user: userA } = await signupAndLogin();
		const { agent: agentB, user: userB } = await signupAndLogin();
		const { agent: agentC, user: userC } = await signupAndLogin();

		await agentA.post(`/api/matches/swipe-right/${userB._id}`);
		await agentB.post(`/api/matches/swipe-right/${userA._id}`);
		await agentA.post(`/api/matches/swipe-right/${userC._id}`);
		await agentC.post(`/api/matches/swipe-right/${userA._id}`);

		// B messaged first, then C messaged more recently - C should sort above B,
		// and the never-messaged case shouldn't apply here since both have texted.
		await agentB.post("/api/messages/send").send({ receiverId: userA._id, content: "hi from B" });
		await agentC.post("/api/messages/send").send({ receiverId: userA._id, content: "hi from C" });

		const res = await agentA.get("/api/matches");
		expect(res.status).toBe(200);
		expect(res.body.matches.map((m) => m._id)).toEqual([userC._id, userB._id]);
		expect(res.body.matches[0].lastMessage).toMatchObject({ content: "hi from C" });
	});

	it("puts matches with no messages after matches with messages", async () => {
		const { agent: agentA, user: userA } = await signupAndLogin();
		const { agent: agentB, user: userB } = await signupAndLogin();
		const { agent: agentC, user: userC } = await signupAndLogin();

		await agentA.post(`/api/matches/swipe-right/${userB._id}`);
		await agentB.post(`/api/matches/swipe-right/${userA._id}`);
		await agentA.post(`/api/matches/swipe-right/${userC._id}`);
		await agentC.post(`/api/matches/swipe-right/${userA._id}`);

		// Only B has ever messaged A - C is a match with an empty conversation.
		await agentB.post("/api/messages/send").send({ receiverId: userA._id, content: "hi from B" });

		const res = await agentA.get("/api/matches");
		expect(res.body.matches.map((m) => m._id)).toEqual([userB._id, userC._id]);
		expect(res.body.matches[1].lastMessage).toBeNull();
	});
});

describe("GET /api/matches/likers/:userId", () => {
	it("blocks looking up another user's likers", async () => {
		const { agent } = await signupAndLogin();
		const { user: otherUser } = await signupAndLogin();
		const res = await agent.get(`/api/matches/likers/${otherUser._id}`);
		expect(res.status).toBe(403);
	});
});

describe("POST /api/matches/super-like/:likedUserId", () => {
	it("requires an active subscription", async () => {
		const { agent: agentA } = await signupAndLogin();
		const { user: userB } = await signupAndLogin();

		const res = await agentA.post(`/api/matches/super-like/${userB._id}`);
		expect(res.status).toBe(402);
		expect(res.body.requiresSubscription).toBe(true);
	});

	it("instantly matches when the caller has an active subscription", async () => {
		const { agent: agentA, user: userA } = await signupAndLogin();
		const { agent: agentB, user: userB } = await signupAndLogin();

		await agentA.post("/api/subscription").send({
			userId: userA._id,
			subscriptionType: "Gold",
			subscribedOn: new Date().toISOString(),
			expiresOn: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
		});

		const res = await agentA.post(`/api/matches/super-like/${userB._id}`);
		expect(res.status).toBe(200);
		expect(res.body.matched).toBe(true);

		// B never swiped on A at all, yet the match exists on both sides
		const matchesB = await agentB.get("/api/matches");
		expect(matchesB.body.matches.map((m) => m._id)).toContain(userA._id);
	});

	it("rejects an expired subscription", async () => {
		const { agent: agentA, user: userA } = await signupAndLogin();
		const { user: userB } = await signupAndLogin();

		await agentA.post("/api/subscription").send({
			userId: userA._id,
			subscriptionType: "Silver",
			subscribedOn: new Date(Date.now() - 60 * 24 * 60 * 60 * 1000).toISOString(),
			expiresOn: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString(),
		});

		const res = await agentA.post(`/api/matches/super-like/${userB._id}`);
		expect(res.status).toBe(402);
	});

	it("rejects super liking yourself", async () => {
		const { agent, user } = await signupAndLogin();
		const res = await agent.post(`/api/matches/super-like/${user._id}`);
		expect(res.status).toBe(403);
	});
});
