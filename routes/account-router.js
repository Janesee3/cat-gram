const express = require("express");
const jwt = require("jsonwebtoken");
const { jwtOptions } = require("../config/passport");
const User = require("../models/User");
const errorHandler = require("../middlewares/error-handler");

const router = express.Router();
router.use(express.json());

router.post("/signup", async (req, res, next) => {
	const { username, password } = req.body;

	if (!password) {
		let error = { name: "ValidationError", message: "password is required!" };
		next(error);
		return;
	}

	const user = new User({ username });
	user.setHashedPassword(password);

	try {
		await user.save();
		res.json({ user });
	} catch (err) {
		next(err);
	}
});

router.post("/login", async (req, res) => {
	const { username, password } = req.body;

	const user = await User.findOne({ username });

	if (!user) {
		res.status(401).json({ message: "No such user found." });
		return;
	}

	if (user.validatePassword(password)) {
		const userId = { userId: user._id };
		const token = jwt.sign(userId, jwtOptions.secretOrKey);
		res.json({ message: "Sign in success.", token: token });
	} else {
		res.status(401).json({ message: "Incorrect password." });
	}
});

module.exports = app => {
	app.use("/account", router, errorHandler);
};
