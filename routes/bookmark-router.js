const express = require("express");
const { passport } = require("../config/passport");
const Post = require("../models/Post");
const User = require("../models/User");
const { getNotFoundError } = require("../utility/custom-errors");
const errorHandler = require("../middlewares/error-handler");
const isUserAuthorisedForBookmarkAction = require("../middlewares/bookmark-authorisation-checker");

const POST_NOT_FOUND_MSG = "No such post exists!";

const router = express.Router();

router.post(
	"/addToBookmarks",
	isUserAuthorisedForBookmarkAction,
	async (req, res, next) => {
		let user;
		try {
			let post = await Post.findById(req.body.postId);

			if (!post) {
				next(getNotFoundError(POST_NOT_FOUND_MSG));
				return;
			}

			user = await User.findById(req.body.userId);
			user.bookmarked.push(req.body.postId.toString());
			user = await user.save();
			res.json(user);
		} catch (err) {
			next(err);
		}
	}
);

router.post(
	"/removeFromBookmarks",
	isUserAuthorisedForBookmarkAction,
	async (req, res, next) => {
		try {
			let post = await Post.findById(req.body.postId);

			if (!post) {
				next(getNotFoundError(POST_NOT_FOUND_MSG));
				return;
			}

			user = await User.findById(req.body.userId);
			user.bookmarked = user.bookmarked.filter(id => {
				return id.toString() !== req.body.postId;
			});
			user = await user.save();
			res.json(user);
		} catch (err) {
			next(err);
		}
	}
);

module.exports = app => {
	app.use(express.json());
	app.use(
		"/bookmarks",
		passport.authenticate("jwt", { session: false }),
		router,
		errorHandler
	);
};
