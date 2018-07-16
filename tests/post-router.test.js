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

beforeAll(async () => {
	jest.setTimeout(120000);

	const uri = await mongod.getConnectionString();
	await mongoose.connect(uri);

	await addFakeData();
});

afterAll(() => {
	mongoose.disconnect();
	mongod.stop();
});

it("GET /posts should return message", async () => {
	let response = await request(app).get("/posts");

	expect(response.status).toBe(200);
	expect(response.body.length).toBe(2);
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
