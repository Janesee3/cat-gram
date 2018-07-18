const express = require("express");
const request = require("supertest");
const userRouter = require("../routes/user-router");
const User = require("../models/User");
const {
	addFakeData,
	createMockUser,
	loginAsMockUser
} = require("../utility/test-utility");

const { MongoMemoryServer } = require("mongodb-memory-server");
const mongod = new MongoMemoryServer();
const mongoose = require("mongoose");

const app = express();
userRouter(app);

const mockUsers = {};
const mockPosts = {};
const credentials = {
	username: "jane",
	password: "1234"
};
let authenticatedUser = {};
let token;

/**** SETUP ***/

beforeAll(async () => {
	jest.setTimeout(120000);

	const uri = await mongod.getConnectionString();
	await mongoose.connect(uri);
});

afterAll(() => {
	mongoose.disconnect();
	mongod.stop();
});

beforeEach(async () => {
	mongoose.connection.db.dropDatabase();

	await addFakeData(mockUsers, mockPosts);
	authenticatedUser = (await createMockUser(credentials)).user;
	token = (await loginAsMockUser(credentials)).token;
});

/** TEST CASES **/

// UNPROTECTED

describe("GET /users", () => {
	it("should return list of existing users, where each user object also has a field that shows the list of posts authored", async () => {
		let response = await request(app).get("/users");

		expect(response.status).toBe(200);
		expect(Array.isArray(response.body)).toBe(true);
		expect(response.body.length).toBe(3);

		let postsByUser = response.body[0].posts;
		expect(Array.isArray(postsByUser)).toBe(true);
		expect(postsByUser.length).toBe(1);
	});
});

describe("GET /users/id", () => {
	it("should return status 200 when given a valid user ID, and user object should contain list of posts authored.", async () => {
		let testId = mockUsers.user1._id.toString();
		let response = await request(app).get(`/users/${testId}`);

		expect(response.body._id).toBe(testId);
		expect(Array.isArray(response.body.posts)).toBe(true);
	});

	it("should return status 404 when given a user ID that doesnt exist", async () => {
		let testId = "5b4c383b6eb02e0a56534c6d";
		let response = await request(app).get(`/users/${testId}`);

		expect(response.status).toBe(404);
	});

	it("should return status 500 when given a post ID that is invalid", async () => {
		let testId = "invalid id";
		let response = await request(app).get(`/users/${testId}`);

		expect(response.status).toBe(500);
	});
});

// PROTECTED

describe("PUT /users/id", () => {
	it("should return status 200 and correctly update the post object when given a valid user ID and its respective auth token", async () => {
		let UPDATED_BIO = "My New Bio!";
		let testId = authenticatedUser._id.toString();

		let response = await request(app)
			.put(`/users/${testId}`)
			.send({
				bio: UPDATED_BIO
			})
			.set("Authorization", "Bearer " + token);

		expect(response.status).toBe(200);
		expect(response.body.bio).toBe(UPDATED_BIO);
	});

	it("should return status 403 when given a user ID that doesnt exist with valid auth token", async () => {
		let testId = "5b4c383b6eb02e0a56534c6d";
		let response = await request(app)
			.put(`/users/${testId}`)
			.set("Authorization", "Bearer " + token);

		expect(response.status).toBe(403);
	});

	it("should return status 500 when given a post ID that is invalid with valid auth token", async () => {
		let testId = "invalid id";
		let response = await request(app)
			.get(`/users/${testId}`)
			.set("Authorization", "Bearer " + token);

		expect(response.status).toBe(500);
	});

	it("should return status 403 when given a valid user ID but uses an auth token retrieved from another user login", async () => {
		let UPDATED_BIO = "My New Bio!";
		let testId = mockUsers.user1._id.toString();

		let response = await request(app)
			.put(`/users/${testId}`)
			.send({
				bio: UPDATED_BIO
			})
			.set("Authorization", "Bearer " + token);

		expect(response.status).toBe(403);
	});
});

describe.skip("DELETE /users/id", () => {
	it("should return status 200 and remove the post object when given a valid user ID", async () => {
		let testId = mockUsers.user1._id.toString();

		let response = await request(app).delete(`/users/${testId}`);

		expect(response.status).toBe(200);
		expect(await User.findById(testId)).toBe(null);
	});

	it("should return status 404 when given a puserost ID that doesnt exist", async () => {
		let testId = "5b4c383b6eb02e0a56534c6d";
		let response = await request(app).delete(`/users/${testId}`);

		expect(response.status).toBe(404);
	});

	it("should return status 500 when given a user ID that is invalid", async () => {
		let testId = "invalid id";
		let response = await request(app).delete(`/users/${testId}`);

		expect(response.status).toBe(500);
	});
});
