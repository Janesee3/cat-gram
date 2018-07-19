
/**** MOCK DATA ****/

const Post = require("../models/Post");
const User = require("../models/User");

const _addMockUsers = async mockUsers => {
	const user1 = new User({
		username: "MockUser1",
		bio: "Hello Im mock user 1"
	});

	const user2 = new User({
		username: "MockUser2",
		bio: "Hello Im mock user 2"
	});

	mockUsers.user1 = await user1.save();
	mockUsers.user2 = await user2.save();
};

const _addMockPosts = async (mockUsers, mockPosts) => {
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

const addFakeData = async (mockUsers, mockPosts) => {
	await _addMockUsers(mockUsers);
	await _addMockPosts(mockUsers, mockPosts);
};

const express = require("express");
const request = require("supertest");
const accountRouter = require("../routes/account-router");
const app = express();
accountRouter(app);

const createMockUser = async credentials => {
	let response = await request(app)
		.post("/account/signup")
		.send(credentials);

	expect(response.statusCode).toBe(200);
	return response.body;
};

const loginAsMockUser = async credentials => {
	let response = await request(app)
		.post("/account/login")
		.send(credentials);

	expect(response.statusCode).toBe(200);
	return response.body;
};

/***** MONGOOSE MEMORY SERVER *****/

const { MongoMemoryServer } = require("mongodb-memory-server");
const mongod = new MongoMemoryServer();
const mongoose = require("mongoose");

const startUpMongoose = async () => {
	jest.setTimeout(120000);
	const uri = await mongod.getConnectionString();
	await mongoose.connect(uri);
}

const tearDownMongoose = async () => {
	mongoose.disconnect();
	mongod.stop();
}

const dropDatabase = async () => {
	mongoose.connection.db.dropDatabase();
}

module.exports = {
	addFakeData,
	createMockUser,
	loginAsMockUser,
	startUpMongoose,
	tearDownMongoose,
	dropDatabase
};
