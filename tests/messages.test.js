import { describe, expect, it } from "vitest";
import { signupAndLogin } from "./helpers.js";

const matchUp = async (agentA, userA, agentB, userB) => {
	await agentA.post(`/api/matches/swipe-right/${userB._id}`);
	await agentB.post(`/api/matches/swipe-right/${userA._id}`);
};

describe("POST /api/messages/send", () => {
	it("blocks messaging a user you haven't matched with", async () => {
		const { agent } = await signupAndLogin();
		const { user: stranger } = await signupAndLogin();

		const res = await agent.post("/api/messages/send").send({ receiverId: stranger._id, content: "hey" });
		expect(res.status).toBe(403);
	});

	it("allows messaging a matched user", async () => {
		const { agent: agentA, user: userA } = await signupAndLogin();
		const { agent: agentB, user: userB } = await signupAndLogin();
		await matchUp(agentA, userA, agentB, userB);

		const res = await agentA.post("/api/messages/send").send({ receiverId: userB._id, content: "hey B" });
		expect(res.status).toBe(201);
		expect(res.body.message.content).toBe("hey B");
	});

	it("rejects empty content", async () => {
		const { agent: agentA, user: userA } = await signupAndLogin();
		const { agent: agentB, user: userB } = await signupAndLogin();
		await matchUp(agentA, userA, agentB, userB);

		const res = await agentA.post("/api/messages/send").send({ receiverId: userB._id, content: "   " });
		expect(res.status).toBe(400);
	});
});

describe("GET /api/messages/conversation/:userId", () => {
	it("returns messages between the two matched users with pagination metadata", async () => {
		const { agent: agentA, user: userA } = await signupAndLogin();
		const { agent: agentB, user: userB } = await signupAndLogin();
		await matchUp(agentA, userA, agentB, userB);

		await agentA.post("/api/messages/send").send({ receiverId: userB._id, content: "one" });
		await agentB.post("/api/messages/send").send({ receiverId: userA._id, content: "two" });

		const res = await agentA.get(`/api/messages/conversation/${userB._id}`);
		expect(res.status).toBe(200);
		expect(res.body.messages).toHaveLength(2);
		expect(res.body).toMatchObject({ page: 1, total: 2, hasMore: false });
	});
});
