const express = require("express");
const request = require("supertest");
const app = require("../app");

const { MongoMemoryServer } = require("mongodb-memory-server");
const mongod = new MongoMemoryServer();
const mongoose = require("mongoose");

const Jane = {
	username: "jane",
	password: "1234"
};

_signupAsJane = async () => {
	let response = await request(app)
		.post("/users/signup")
		.send(Jane);

	expect(response.statusCode).toBe(200);
};

beforeAll(async () => {
	jest.setTimeout(120000);

	const uri = await mongod.getConnectionString();
	await mongoose.connect(uri);

	await _signupAsJane();
});

afterAll(() => {
	mongoose.disconnect();
	mongod.stop();
});

it("GET / should return welcome message", async () => {
	const response = await request(app).get("/");
	expect(response.body).toBe("CatGram API is up!");
});

describe("POST /login", () => {
	it("should return status 200 and a token after a valid sign in ", async () => {
		let response = await request(app)
			.post("/login")
			.send(Jane);

		expect(response.status).toBe(200);
		expect(response.body.hasOwnProperty("token")).toBe(true);
	});

	it("should return status 401 if username or password not provided", async () => {
		let response = await request(app)
			.post("/login")
			.send({ username: "jane" });

		expect(response.status).toBe(401);
		expect(response.body.hasOwnProperty("token")).not.toBe(true);

		response = await request(app)
			.post("/login")
			.send({ password: "jane" });

		expect(response.status).toBe(401);
		expect(response.body.hasOwnProperty("token")).not.toBe(true);
	});

	it("should return status 401 if username or password is incorrect", async () => {
		let response = await request(app)
			.post("/login")
			.send({ username: "jane", password: "fake" });

		expect(response.status).toBe(401);
		expect(response.body.hasOwnProperty("token")).not.toBe(true);

		response = await request(app)
			.post("/login")
			.send({ username: "fake", password: "1234" });

		expect(response.status).toBe(401);
		expect(response.body.hasOwnProperty("token")).not.toBe(true);
	});
});
