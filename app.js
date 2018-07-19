const express = require("express");
const mongoose = require("mongoose");
const { passport } = require("./config/passport");
const swaggerUi = require("swagger-ui-express");
const swaggerDocument = require("./swagger.json");

const indexRouter = require("./routes/index-router");
const accountRouter = require("./routes/account-router");
const postRouter = require("./routes/post-router");
const userRouter = require("./routes/user-router");
const bookmarkRouter = require("./routes/bookmark-router");
const likesRouter = require("./routes/likes-router");

// Open DB connection
mongoose.connect(process.env.MONGODB_URI || "mongodb://localhost/cat-gram");
const db = mongoose.connection;
db.on("error", error => {
	console.error("An error occurred!", error);
});

const app = express();

app.use(express.json());
app.use(passport.initialize());
app.use(function(req, res, next) {
	res.header("Access-Control-Allow-Origin", "*");
	res.header(
		"Access-Control-Allow-Headers",
		"Origin, X-Requested-With, Content-Type, Accept"
	);
	next();
});
app.use("/api-docs", swaggerUi.serve, swaggerUi.setup(swaggerDocument));

// Custom Routers

indexRouter(app);
accountRouter(app);
userRouter(app);
postRouter(app);
bookmarkRouter(app);
likesRouter(app);

// general 404 error handler
app.use((req, res, next) => {
	res.status(404).json("Page Not Found!");
});

// general 500 error handler
app.use((err, req, res, next) => {
	res.status(500).json(err);
});

module.exports = app;
