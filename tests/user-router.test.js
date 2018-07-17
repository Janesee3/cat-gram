const express = require("express");
const request = require("supertest");
const userRouter = require("../routes/user-router");
const Post = require("../models/Post");
const User = require("../models/User");

const { MongoMemoryServer } = require("mongodb-memory-server");
const mongod = new MongoMemoryServer();
const mongoose = require("mongoose");

const app = express();
userRouter(app);

const mockUsers = {};
const mockPosts = {};

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
	await addFakeData();
});

/** TEST CASES **/

describe.only("GET /users", () => {
	it("should return list of existing users, where each user object also has a field that shows the list of posts authored", async () => {
		let response = await request(app).get("/users");

		expect(response.status).toBe(200);
		expect(Array.isArray(response.body)).toBe(true);
		expect(response.body.length).toBe(2);

		let postsByUser = response.body[0].posts;
		expect(Array.isArray(postsByUser)).toBe(true);
		expect(postsByUser.length).toBe(1);
	});
});

describe("POST /users", () => {
	it("should return status 201 when given a valid request body, and increment list of users by 1", async () => {
		let response = await request(app)
			.post("/users")
			.send({
				username: "test user",
				bio: "hello im a test user"
			});

		expect(response.status).toBe(201);
		const users = await User.find();
		expect(users.length).toBe(3); // increased by 1
	});

	it("should return status 400 when given an invalid request body that lacks any of the required fields", async () => {
		let response = await request(app)
			.post("/users")
			.send({
				bio: "hello im a test user"
			});

		expect(response.status).toBe(400);
	});

	// TODO: Test case for non-unique username
});

describe("GET /users/id", () => {
	it("should return status 200 when given a valid posusert ID", async () => {
		let testId = mockUsers.user1._id.toString();
		let response = await request(app).get(`/users/${testId}`);

		expect(response.body._id).toBe(testId);
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

describe("PUT /users/id", () => {
	it("should return status 200 and correctly update the post object when given a valid user ID", async () => {
		let UPDATED_BIO = "My New Bio!";
		let testId = mockUsers.post1._id.toString();

		let response = await request(app)
			.put(`/users/${testId}`)
			.send({
				caption: UPDATED_BIO
			});

		expect(response.status).toBe(200);
		let newUser = await User.findById(testId);
		expect(newUser.bio).toBe(UPDATED_BIO);
	});

	it("should return status 404 when given a user ID that doesnt exist", async () => {
		let testId = "5b4c383b6eb02e0a56534c6d";
		let response = await request(app).put(`/users/${testId}`);

		expect(response.status).toBe(404);
	});

	it("should return status 500 when given a post ID that is invalid", async () => {
		let testId = "invalid id";
		let response = await request(app).get(`/users/${testId}`);

		expect(response.status).toBe(500);
	});
});

describe("DELETE /users/id", () => {
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

/** UTILITY METHODS FOR MOCK DATA **/

const _addMockUsers = async () => {
	const user1 = new User({
		username: "Mock User 1",
		bio: "Hello Im mock user 1"
	});

	const user2 = new User({
		username: "Mock User 2",
		bio: "Hello Im mock user 2"
	});

	mockUsers.user1 = await user1.save();
	mockUsers.user2 = await user2.save();
};

const _addMockPosts = async () => {
	const post1 = new Post({
		author: mockUsers.user1._id,
		caption: "Cheesy caption for post1",
		image: "https://sampleurl.com"
	});

	const post2 = new Post({
		author: mockUsers.user2._id,
		caption: "my caption for post 2",
		image: "https://sampleurl.com"
	});

	mockPosts.post1 = await post1.save();
	mockPosts.post2 = await post2.save();
};

const addFakeData = async () => {
	await _addMockUsers();
	await _addMockPosts();
};
