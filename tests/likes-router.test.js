const express = require("express");
const request = require("supertest");
const likesRouter = require("../routes/likes-router");
const User = require("../models/User");
const Post = require("../models/Post");
const {
	startUpMongoose,
	tearDownMongoose,
	addFakeData,
	createMockUser,
	loginAsMockUser,
	dropDatabase
} = require("../utility/test-utility");

const app = express();
likesRouter(app);

// Mock Data
const mockUsers = {};
const mockPosts = {};
const credentials = {
	username: "jane",
	password: "1234"
};
let token;
let authenticatedUser = {};

/**** SETUP ***/

beforeAll(startUpMongoose);
afterAll(tearDownMongoose);
beforeEach(dropDatabase);

// Setup required fixtures
beforeEach(async () => {
	await addFakeData(mockUsers, mockPosts);
	authenticatedUser = await createMockUser(credentials);
	token = (await loginAsMockUser(credentials)).token;
});

const _likePost = async (postId, userId, jwt) => {
	let response = await request(app)
		.post("/likes/likePost")
		.send({
			postId: postId,
			userId: userId
		})
		.set("Authorization", "Bearer " + jwt);

	return response;
};

const _unlikePost = async (postId, userId, jwt) => {
	let response = await request(app)
		.post("/likes/unlikePost")
		.send({
			postId: postId,
			userId: userId
		})
		.set("Authorization", "Bearer " + jwt);

	return response;
};

it("should return status 200 and increment likes counter of specified post by 1 (when valid auth token is given)", async () => {
	let res = await _likePost(mockPosts.post1._id, authenticatedUser._id, token);
	expect(res.status).toBe(200);
	expect(res.body.likes).toBe(1);
});

it("should return status 400 if specified user has already liked the post (when valid auth token is given)", async () => {
	await _likePost(mockPosts.post1._id, authenticatedUser._id, token);

	let res = await _likePost(mockPosts.post1._id, authenticatedUser._id, token);
	let post = await Post.findById(mockPosts.post1._id);
	expect(res.status).toBe(400);
	expect(post.likes).toBe(1);
});
