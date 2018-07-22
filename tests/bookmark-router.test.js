const express = require("express");
const request = require("supertest");
const bookmarkRouter = require("../routes/bookmark-router");
const User = require("../models/User");
const {
	startUpMongoose,
	tearDownMongoose,
	addFakeData,
	createMockUser,
	loginAsMockUser,
	dropDatabase
} = require("../utility/test-utility");

const app = express();
bookmarkRouter(app);

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

const _addPostToBookmarks = async (postId, userId, jwt) => {
	let response = await request(app)
		.post("/bookmarks/addToBookmarks")
		.send({
			postId: postId,
			userId: userId
		})
		.set("Authorization", "Bearer " + jwt);

	return response;
};

const _removePostFromBookmarks = async (postId, userId, jwt) => {
	let response = await request(app)
		.post("/bookmarks/removeFromBookmarks")
		.send({
			postId: postId,
			userId: userId
		})
		.set("Authorization", "Bearer " + jwt);

	return response;
};

describe("POST /bookmarks/addToBookmarks", () => {
	it("should return status 200 and successfully add the specified post (id) to the specified user's bookmark list when given a valid auth token", async () => {
		let response = await _addPostToBookmarks(
			mockPosts.post1._id,
			authenticatedUser._id,
			token
		);

		expect(response.status).toBe(200);
		let user = await User.findById(authenticatedUser._id);
		expect(user.bookmarked.length).toBe(1);
	});

	it("should return status 401 if no auth token / invalid token is given", async () => {
		let response = await _addPostToBookmarks(
			mockPosts.post1._id,
			authenticatedUser._id,
			null
		);

		expect(response.status).toBe(401);
		let user = await User.findById(authenticatedUser._id);
		expect(user.bookmarked.length).toBe(0);
	});

	it("should return status 404 if specified postId does not exists", async () => {
		let response = await _addPostToBookmarks(
			"5b4f017bd72ad60014396ffd",
			authenticatedUser._id,
			token
		);

		expect(response.status).toBe(404);
		let user = await User.findById(authenticatedUser._id);
		expect(user.bookmarked.length).toBe(0);
	});

	it("should return status 400 if specified postId already exists in the user's bookmark list", async () => {
		await _addPostToBookmarks(
			mockPosts.post1._id,
			authenticatedUser._id,
			token
		);

		let response = await _addPostToBookmarks(
			mockPosts.post1._id,
			authenticatedUser._id,
			token
		);

		expect(response.status).toBe(400);
		let user = await User.findById(authenticatedUser._id);
		expect(user.bookmarked.length).toBe(1);
	});
});

describe("POST /bookmarks/removeFromBookmarks", () => {
	it("should return status 200 and successfully remove the specified post (id) to the specified user's bookmark list when given a valid auth token", async () => {
		await _addPostToBookmarks(
			mockPosts.post1._id,
			authenticatedUser._id,
			token
		);

		let response = await _removePostFromBookmarks(
			mockPosts.post1._id,
			authenticatedUser._id,
			token
		);

		expect(response.status).toBe(200);
		let user = await User.findById(authenticatedUser._id);
		expect(user.bookmarked.length).toBe(0);
	});

	it("should return status 401 if no auth token / invalid token is given", async () => {
		await _addPostToBookmarks(
			mockPosts.post1._id,
			authenticatedUser._id,
			token
		);

		let response = await _removePostFromBookmarks(
			mockPosts.post1._id,
			authenticatedUser._id,
			null
		);

		expect(response.status).toBe(401);
		let user = await User.findById(authenticatedUser._id);
		expect(user.bookmarked.length).toBe(1);
	});

	it("should return status 404 if specified postId does not exists", async () => {
		let response = await _removePostFromBookmarks(
			"5b4f017bd72ad60014396ffd",
			authenticatedUser._id,
			token
		);

		expect(response.status).toBe(404);
		let user = await User.findById(authenticatedUser._id);
		expect(user.bookmarked.length).toBe(0);
	});

	it("should return status 400 if specified postId does not exist in the user's bookmark list", async () => {
		let response = await _removePostFromBookmarks(
			mockPosts.post1._id,
			authenticatedUser._id,
			token
		);

		expect(response.status).toBe(400);
		let user = await User.findById(authenticatedUser._id);
		expect(user.bookmarked.length).toBe(0);
	});
});
