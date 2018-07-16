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
		next(err);
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
		next(err);
	}
});

module.exports = app => {
	app.use("/posts", router);
};
