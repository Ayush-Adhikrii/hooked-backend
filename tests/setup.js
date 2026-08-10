import { MongoMemoryServer } from "mongodb-memory-server";
import mongoose from "mongoose";
import { afterAll, afterEach, beforeAll } from "vitest";

// Set before anything imports app.js, whose top-level cors() call reads
// CLIENT_URL at module-eval time.
process.env.JWT_SECRET = process.env.JWT_SECRET || "test_secret_for_vitest";
process.env.CLIENT_URL = process.env.CLIENT_URL || "http://localhost:5173";
process.env.ESEWA_SECRET_KEY = process.env.ESEWA_SECRET_KEY || "test-secret";
process.env.NODE_ENV = "test";

let mongoServer;

beforeAll(async () => {
	mongoServer = await MongoMemoryServer.create();
	await mongoose.connect(mongoServer.getUri());
}, 30000);

// Tests never share state - every collection is wiped after each test.
afterEach(async () => {
	const { collections } = mongoose.connection;
	await Promise.all(Object.values(collections).map((collection) => collection.deleteMany({})));
});

afterAll(async () => {
	await mongoose.disconnect();
	await mongoServer.stop();
});
