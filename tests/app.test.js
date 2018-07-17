const request = require("supertest");
const app = require("../app");

it("GET / should return welcome message", async () => {
	const response = await request(app).get("/");
	expect(response.body).toBe("CatGram API is up!");
});
