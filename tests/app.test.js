const app = require("../app");
const request = require("supertest");

it("GET / should return dummy string in response body", async () => {
	const response = await request(app).get("/");
	expect(response.body).toBe("hello");
});
