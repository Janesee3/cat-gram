const express = require("express");
const request = require("supertest");
const indexRouter = require("../routes/index-router");

const app = express();
indexRouter(app);

it("GET / should return welcome message", async () => {
	const response = await request(app).get("/");
	expect(response.body).toBe("CatGram API is up!");
});

it.skip("POST /signin should return status 200 and a token after a valid sign in ", async () => {
	let response = await request(app).post("/signin");

	expect(response.status).toBe(200);
	expect(response.body.hasOwnProperty("token")).toBe(true);
});
