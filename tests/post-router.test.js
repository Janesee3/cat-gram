const express = require("express");
const request = require("supertest");
const postRouter = require("../routes/post-router");

const app = express();
postRouter(app);

it("GET /posts should return message", async () => {
	let response = await request(app).get("/posts");

	expect(response.status).toBe(200);
	expect(response.body).toBe("Hi from post router.");
});
