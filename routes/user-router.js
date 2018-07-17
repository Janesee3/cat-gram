const express = require("express");
const router = express.Router();
const User = require("../models/User");
const Post = require("../models/Post");
const mongoose = require("mongoose");

router.use(express.json());

router.get("/", async (req, res, next) => {
	try {
		let users = await User.find();

		let promises = users.map(async user => { // will return an array of promises
			let posts = await Post.find({ author: user._id });
			let combinedUserObj = { ...user.toJSON(), posts: posts };
			return combinedUserObj;
		});

		let results = await Promise.all(promises);
		res.json(results);
	} catch (err) {
		console.log(err);
		return handleError(res, err, next);
	}
});

const fireNotFoundError = (res, next) => {
	return handleError(
		res,
		{ name: "NotFoundError", message: "Cannot find post with this id!" },
		next
	);
};

const handleError = (res, err, next) => {
	if (err.name === "ValidationError") {
		// will enter here for CastError and ValidatorError (custom, required and unique validators)
		// for operations involving writing to db
		res.status(400).json(err.message);
		return;
	}

	if (err.name === "NotFoundError") {
		res.status(404).json(err.message);
		return;
	}

	next(err);
};

module.exports = app => {
	app.use("/users", router);
};
