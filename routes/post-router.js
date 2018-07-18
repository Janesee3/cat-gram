const express = require("express");
const { passport } = require("../config/passport");
const Post = require("../models/Post");
const errorHandler = require("../middlewares/mongoose-error-handler");
const isUserAuthorisedForPostAction = require("../middlewares/post-action-authorisation-checker");

const unprotectedRoutes = express.Router();

unprotectedRoutes.get("/", async (req, res, next) => {
	try {
		const posts = await Post.find().populate("author"); // 'author' here refers to the KEY name inside the Post model!
		res.json(posts);
	} catch (err) {
		next(err);
	}
});

unprotectedRoutes.get("/:id", async (req, res, next) => {
	try {
		let post = await Post.findById(req.params.id).populate("author");
		if (!post) return _fireNotFoundError(res, next);
		res.json(post);
	} catch (err) {
		next(err);
	}
});

const protectedRoutes = express.Router();

protectedRoutes.post("/", async (req, res, next) => {
	const newPost = new Post({
		author: req.user._id, // id of the currently authenticated user
		caption: req.body.caption,
		image: req.body.image
	});

	try {
		let createdPost = await newPost.save();
		res.status(201).json({
			message: `Successfully created a new post.`,
			post: createdPost
		});
	} catch (err) {
		next(err);
	}
});

protectedRoutes.put(
	"/:id",
	isUserAuthorisedForPostAction,
	async (req, res, next) => {
		try {
			console.log("I WAS HERE!!");
			let post = await Post.findByIdAndUpdate(req.params.id, req.body, {
				new: true
			});
			if (!post) return _fireNotFoundError(res, next);
			res.json(post);
		} catch (err) {
			next(err);
		}
	}
);

protectedRoutes.delete("/:id", async (req, res, next) => {
	try {
		let post = await Post.findByIdAndDelete(req.params.id);
		if (!post) return _fireNotFoundError(res, next);
		res.json({
			message: `Successfully deleted post with ID ${req.params.id}.`
		});
	} catch (err) {
		next(err);
	}
});

const _fireNotFoundError = (res, next) => {
	let err = {
		name: "NotFoundError",
		message: "Cannot find post with this id!"
	};
	next(err);
};

module.exports = app => {
	app.use(express.json());
	app.use("/posts", unprotectedRoutes, errorHandler);
	app.use(
		"/posts",
		passport.authenticate("jwt", { session: false }),
		protectedRoutes,
		errorHandler
	);
};
