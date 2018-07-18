const express = require("express");
const request = require("supertest");
const postRouter = require("../routes/post-router");
const Post = require("../models/Post");
const {
	addFakeData,
	createMockUser,
	loginAsMockUser
} = require("../utility/test-utility");

const { MongoMemoryServer } = require("mongodb-memory-server");
const mongod = new MongoMemoryServer();
const mongoose = require("mongoose");

const app = express();
postRouter(app);

const mockUsers = {};
const mockPosts = {};
const credentials = {
	username: "jane",
	password: "1234"
};
let authenticatedUser = {};
let token;

// What i need //
// create a mock user (need to use sign up route)
// login with this user credentials (need to use login route)
// retrieve the jwt token and store it in the test file
// make use of the token to test all the authorised routes here
// then test for the deauthorised path also

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

/****  TEST CASES *****/

// UNPROTECTED

it("GET /posts should return list of existing posts", async () => {
	let response = await request(app).get("/posts");

	expect(response.status).toBe(200);
	expect(Array.isArray(response.body)).toBe(true);
	expect(response.body.length).toBe(2);
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

// PROTECTED

describe.only("POST /posts", () => {
	it("should return status 201 when given a valid request body, and increment list of posts by 1", async () => {
		let response = await request(app)
			.post("/posts")
			.send({
				caption: "Hello im a test post",
				image: "https://sampleurl.com"
			})
			.set("Authorization", "Bearer " + token);

		expect(response.status).toBe(201);
		const posts = await Post.find();
		expect(posts.length).toBe(3); // increased by 1
	});

	it("should return status 400 when given an invalid request body that lacks any of the required fields with valid auth token", async () => {
		let response = await request(app)
			.post("/posts")
			.send({
				image: "https://sampleurl.com"
			})
			.set("Authorization", "Bearer " + token);

		expect(response.status).toBe(400);
	});

	it("should return status 401 when no auth token is given", async () => {
		let response = await request(app)
			.post("/posts")
			.send({
				caption: "Hello im a test post",
				image: "https://sampleurl.com"
			});

		expect(response.status).toBe(401);
	});

	it("should return status 401 when given an author ID that does not exists", async () => {
		let response = await request(app)
			.post("/posts")
			.send({
				caption: "Hello im a test post",
				image: "https://sampleurl.com"
			})
			.set("Authorization", "Bearer " + "invalidtoken");

		expect(response.status).toBe(401);
	});
});

describe("PUT /posts/id", () => {
	it("should return status 200 and correctly update the post object when given a valid post ID and its respective auth token", async () => {
		let UPDATED_CAPTION = "updated caption";
		let testId = authenticatedUser._id.toString();

		let response = await request(app)
			.put(`/posts/${testId}`)
			.send({
				caption: UPDATED_CAPTION
			})
			.set("Authorization", "Bearer " + token);

		expect(response.status).toBe(200);
		expect(response.body.caption).toBe(UPDATED_CAPTION);
	});

	it("should return status 403 when given a post ID that doesnt exist with valid auth token", async () => {
		let testId = "5b4c383b6eb02e0a56534c6d";
		let response = await request(app).put(`/posts/${testId}`);

		expect(response.status).toBe(403);
	});

	it("should return status 403 when given a post ID that is invalid with auth token", async () => {
		let testId = "invalid id";
		let response = await request(app).get(`/posts/${testId}`);

		expect(response.status).toBe(403);
	});

	it("should return status 403 when given a valid user ID but uses an auth token retrieved from another user login", async () => {
		let UPDATED_CAPTION = "updated caption";
		let testId = mockPosts.post1._id.toString();

		let response = await request(app)
			.put(`/posts/${testId}`)
			.send({
				caption: UPDATED_CAPTION
			});

		expect(response.status).toBe(403);
	});
});

describe("DELETE /posts/id", () => {
	it("should return status 200 and remove the post object when given a valid post ID", async () => {
		let testId = mockPosts.post1._id.toString();

		let response = await request(app).delete(`/posts/${testId}`);

		expect(response.status).toBe(200);
		expect(await Post.findById(testId)).toBe(null);
	});

	it("should return status 404 when given a post ID that doesnt exist", async () => {
		let testId = "5b4c383b6eb02e0a56534c6d";
		let response = await request(app).delete(`/posts/${testId}`);

		expect(response.status).toBe(404);
	});

	it("should return status 500 when given a post ID that is invalid", async () => {
		let testId = "invalid id";
		let response = await request(app).delete(`/posts/${testId}`);

		expect(response.status).toBe(500);
	});
});
