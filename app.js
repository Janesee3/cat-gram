const express = require("express");
const mongoose = require("mongoose");
const swaggerUi = require("swagger-ui-express");
const swaggerDocument = require("./swagger.json");

const postRouter = require("./routes/post-router");

const Post = require("./models/Post");
const User = require("./models/User");

// Open DB connection

mongoose.connect(process.env.MONGODB_URI || "mongodb://localhost/cat-gram");
const db = mongoose.connection;
db.on("error", error => {
	console.error("An error occurred!", error);
});

// const sampleUser = new User({
// 	username: "Ms Cat",
// 	bio: "Hello, I meow."
// });

// sampleUser.save();

// const samplePost = new Post({
// 	author: "5b4c38193a68d009eb5fb3c0",
// 	caption: "Im just a cat photo",
// 	image: "http://sampleurl.com",
// 	likes: 10
// });

// samplePost.save();

const app = express();

app.use(express.json());

app.use("/api-docs", swaggerUi.serve, swaggerUi.setup(swaggerDocument));
app.get("/", (req, res, next) => {
	res.json("hello");
});
postRouter(app);

module.exports = app;
