const express = require("express");
const jwt = require("jsonwebtoken");
const { jwtOptions } = require("../config/passport");
const User = require("../models/User");

const router = express.Router();
router.use(express.json());

router.get("/", (req, res) => {
	res.json("CatGram API is up!");
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
	app.use("/", router);
};
