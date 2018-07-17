const express = require("express");
const request = require("supertest");
const accountRouter = require("../routes/account-router");
const User = require("../models/User");

const { MongoMemoryServer } = require("mongodb-memory-server");
const mongod = new MongoMemoryServer();
const mongoose = require("mongoose");

const app = express();
accountRouter(app);

const credentials = {
	username: "jane",
	password: "1234"
};

_createMockUser = async () => {
	let response = await request(app)
		.post("/account/signup")
		.send(credentials);

	return response;
};

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

/**** TEST CASES ***/

describe("POST /account/signup", () => {
	it("should return status 201 when given a valid request body, and increment list of users by 1", async () => {
		let response = await request(app)
			.post("/account/signup")
			.send({
				username: "testuser",
				password: "12345"
			});

		expect(response.status).toBe(200);
		const users = await User.find();
		expect(users.length).toBe(1); // increased by 1
	});

	it("should return status 400 when given an invalid request body that does not have password", async () => {
		let response = await request(app)
			.post("/account/signup")
			.send({
				username: "testuser"
			});

		expect(response.status).toBe(400);
	});

	it("should return status 400 when given an invalid request body that does not have username", async () => {
		let response = await request(app)
			.post("/account/signup")
			.send({
				password: "password"
			});

		expect(response.status).toBe(400);
	});

	it("should return status 400 when given an invalid username format", async () => {
		let response = await request(app)
			.post("/account/signup")
			.send({
				username: "hi hi",
				password: "password"
			});

		expect(response.status).toBe(400);
	});

	it("should return status 400 when given non-unique username", async () => {
		await _createMockUser();

		let response = await request(app)
			.post("/account/signup")
			.send({
				username: credentials.username,
				password: "password"
			});

		expect(response.status).toBe(400);
	});
});

describe("POST /login", () => {
	beforeAll(async () => {
		await _createMockUser(credentials);
	});

	it("should return status 200 and a token after a valid sign in ", async () => {
		let response = await request(app)
			.post("/account/login")
			.send(credentials);

		expect(response.status).toBe(200);
		expect(response.body.hasOwnProperty("token")).toBe(true);
	});

	it("should return status 401 if username or password not provided", async () => {
		let response = await request(app)
			.post("/account/login")
			.send({ username: "jane" });

		expect(response.status).toBe(401);
		expect(response.body.hasOwnProperty("token")).not.toBe(true);

		response = await request(app)
			.post("/account/login")
			.send({ password: "jane" });

		expect(response.status).toBe(401);
		expect(response.body.hasOwnProperty("token")).not.toBe(true);
	});

	it("should return status 401 if username or password is incorrect", async () => {
		let response = await request(app)
			.post("/account/login")
			.send({ username: "jane", password: "fake" });

		expect(response.status).toBe(401);
		expect(response.body.hasOwnProperty("token")).not.toBe(true);

		response = await request(app)
			.post("/account/login")
			.send({ username: "fake", password: "1234" });

		expect(response.status).toBe(401);
		expect(response.body.hasOwnProperty("token")).not.toBe(true);
	});
});
