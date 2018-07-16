const express = require("express");
const mongoose = require("mongoose");
const swaggerUi = require("swagger-ui-express");
const swaggerDocument = require("./swagger.json");

const Post = require("./models/Post");
const User = require("./models/User");

// Open DB connection
mongoose.connect("mongodb://localhost/cat-gram");
const db = mongoose.connection;
db.on("error", error => {
	console.error("An error occurred!", error);
});

// const samplePost = new Post({
// 	author: "5b4c2f1d862338f2ed2be128",
// 	caption: "Im just a cat",
// 	image: "http://sampleurl.com",
// 	likes: 10
// });

// samplePost.save();

// const sampleUser = new User({
// 	username: "Ms Cat",
// 	bio: "Hello, I meow.",
// 	bookmarked: ["5b4c1e13542fdfdeeb437a9f"]
// });

// sampleUser.save();

const app = express();

app.use(express.json());

app.use("/api-docs", swaggerUi.serve, swaggerUi.setup(swaggerDocument));
app.get("/", (req, res, next) => {
	res.json("hello");
});

module.exports = app;
