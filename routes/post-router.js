const express = require("express");
const router = express.Router();
const Post = require("../models/Post");
const errorHandler = require("../middlewares/mongoose-error-handler");

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

router.get("/:id", async (req, res, next) => {
	try {
		let post = await Post.findById(req.params.id).populate("author");
		if (!post) return fireNotFoundError(res, next);
		res.json(post);
	} catch (err) {
		next(err);
	}
});

router.put("/:id", async (req, res, next) => {
	try {
		let post = await Post.findByIdAndUpdate(req.params.id, req.body, {
			new: true
		});
		if (!post) return fireNotFoundError(res, next);
		res.json(post);
	} catch (err) {
		next(err);
	}
});

router.delete("/:id", async (req, res, next) => {
	try {
		let post = await Post.findByIdAndDelete(req.params.id);
		if (!post) return fireNotFoundError(res, next);
		res.json({
			message: `Successfully deleted post with ID ${req.params.id}.`
		});
	} catch (err) {
		next(err);
	}
});

const fireNotFoundError = (res, next) => {
	let err = {
		name: "NotFoundError",
		message: "Cannot find post with this id!"
	};
	next(err);
};

module.exports = app => {
	app.use("/posts", router, errorHandler);
};
