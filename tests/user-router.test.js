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

it("should pass", async () => {
	let res = await request(app).get("/users");

	expect(res.body).toBe("hello");
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
