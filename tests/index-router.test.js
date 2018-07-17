const express = require("express");
const request = require("supertest");
const indexRouter = require("../routes/index-router");

const app = express();
indexRouter(app);

it("GET / should return welcome message", async () => {
	const response = await request(app).get("/");
	expect(response.body).toBe("CatGram API is up!");
});
