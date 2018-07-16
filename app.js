const express = require("express");
const mongoose = require("mongoose");
const swaggerUi = require("swagger-ui-express");
const swaggerDocument = require("./swagger.json");

// Open DB connection
mongoose.connect("mongodb://localhost/cat-gram");
const db = mongoose.connection;
db.on("error", error => {
	console.error("An error occurred!", error);
});

const app = express();

app.use(express.json());

app.use("/api-docs", swaggerUi.serve, swaggerUi.setup(swaggerDocument));
app.get("/", (req, res, next) => {
	res.json("hello");
});

module.exports = app;
