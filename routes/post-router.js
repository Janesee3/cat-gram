const express = require("express");
const router = express.Router();
const Post = require("../models/Post");
const mongoose = require("mongoose");

router.use(express.json());

router.get("/", async (req, res, next) => {
	try {
		const posts = await Post.find().populate("author"); // 'author' here refers to the KEY name inside the Post model!
		res.json(posts);
	} catch (err) {
		handleError(res, err, next);
	}
});

router.post("/", async (req, res, next) => {
	const newPost = new Post({
		author: req.body.author,
		caption: req.body.caption,
		image: req.body.image
	});

	try {
		await newPost.save();
		res.status(201).json({ message: `Successfully created a new post.` });
	} catch (err) {
		return handleError(res, err, next);
	}
});

const handleError = (res, err, next) => {
	if (err.name === "ValidationError") { // will enter here for CastError and ValidatorError (custom, required and unique validators)
		res.status(400).json(err.message);
	} else {
		next(err);
	}
};

module.exports = app => {
	app.use("/posts", router);
};
