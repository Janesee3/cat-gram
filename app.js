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
app.use(function(req, res, next) {
	res.header("Access-Control-Allow-Origin", "*");
	res.header(
		"Access-Control-Allow-Headers",
		"Origin, X-Requested-With, Content-Type, Accept"
	);
	next();
});
app.use("/api-docs", swaggerUi.serve, swaggerUi.setup(swaggerDocument));
app.get("/", (req, res, next) => {
	res.json("hello");
});

// Custom Routers
postRouter(app);

// general 404 error handler
app.use((req, res, next) => {
	res.status(404).json("Page Not Found!");
});

// general 500 error handler
app.use((err, req, res, next) => {
	res.status(500).json(err);
});

module.exports = app;
