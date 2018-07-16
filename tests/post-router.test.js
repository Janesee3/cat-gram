const express = require("express");
const request = require("supertest");
const postRouter = require("../routes/post-router");
const Post = require("../models/Post");
const User = require("../models/User");

const { MongoMemoryServer } = require("mongodb-memory-server");
const mongod = new MongoMemoryServer();
const mongoose = require("mongoose");

const app = express();
postRouter(app);

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

/****  TEST CASES *****/

it("GET /posts should return message", async () => {
	let response = await request(app).get("/posts");

	expect(response.status).toBe(200);
	expect(response.body.length).toBe(2);
});

describe("POST /posts", () => {
	it("should return status 201 when given a valid request body, and increment list of posts by 1", async () => {
		let response = await request(app)
			.post("/posts")
			.send({
				author: mockUsers.user1._id,
				caption: "Hello im a test post",
				image: "https://sampleurl.com"
			});

		expect(response.status).toBe(201);
		const posts = await Post.find();
		expect(posts.length).toBe(3); // increased by 1
	});

	it("should return status 400 when given an invalid request body that lacks any of the required fields", async () => {
		let response = await request(app)
			.post("/posts")
			.send({
				caption: "Hello im a test post",
				image: "https://sampleurl.com"
			});

		expect(response.status).toBe(400);
	});

	it("should return status 400 when given an invalid author ID type", async () => {
		let response = await request(app)
			.post("/posts")
			.send({
				author: "invalid-one",
				caption: "Hello im a test post",
				image: "https://sampleurl.com"
			});

		expect(response.status).toBe(400);
	});

	it("should return status 400 when given an author ID that does not exists", async () => {
		let response = await request(app)
			.post("/posts")
			.send({
				author: "5b4c38193a68d009eb5fb3c9",
				caption: "Hello im a test post",
				image: "https://sampleurl.com"
			});

		expect(response.status).toBe(400);
	});
});

describe("GET /posts/id", () => {
	it("should return status 200 when given a valid post ID", async () => {
		let testId = mockPosts.post1._id.toString();
		let response = await request(app).get(`/posts/${testId}`);

		expect(response.body._id).toBe(testId);
	});

	it("should return status 404 when given a post ID that doesnt exist", async () => {
		let testId = "5b4c383b6eb02e0a56534c6d";
		let response = await request(app).get(`/posts/${testId}`);

		expect(response.status).toBe(404);
	});

	it("should return status 500 when given a post ID that is invalid", async () => {
		let testId = "invalid id";
		let response = await request(app).get(`/posts/${testId}`);

		expect(response.status).toBe(500);
	});
});

describe("PUT /posts/id", () => {
	it("should return status 200 and correctly update the post object when given a valid post ID", async () => {
		let UPDATED_CAPTION = "updated caption";
		let testId = mockPosts.post1._id.toString();

		let response = await request(app)
			.put(`/posts/${testId}`)
			.send({
				caption: UPDATED_CAPTION
			});

		expect(response.status).toBe(200);
		let newPost = await Post.findById(testId);
		expect(newPost.caption).toBe(UPDATED_CAPTION);
	});

	// it("should return status 404 when given a post ID that doesnt exist", async () => {
	// 	let testId = "5b4c383b6eb02e0a56534c6d";
	// 	let response = await request(app).get(`/posts/${testId}`);

	// 	expect(response.status).toBe(404);
	// });

	// it("should return status 500 when given a post ID that is invalid", async () => {
	// 	let testId = "invalid id";
	// 	let response = await request(app).get(`/posts/${testId}`);

	// 	expect(response.status).toBe(500);
	// });
});

// UTILITY METHODS FOR MOCK DATA

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
		caption: "Cheesy caption for post1",
		image: "https://sampleurl.com"
	});

	mockPosts.post1 = await post1.save();
	mockPosts.post2 = await post2.save();
};

const addFakeData = async () => {
	await _addMockUsers();
	await _addMockPosts();
};
