const express = require("express");
const { passport } = require("../config/passport");
const Post = require("../models/Post");
const User = require("../models/User");
const { getNotFoundError } = require("../utility/custom-errors");
const errorHandler = require("../middlewares/mongoose-error-handler");
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
		} catch (err) {
			next(err);
			return;
		}

		res.json(user);
	}
);

router.post("/removeFromBookmarks", (req, res, next) => {
	res.json(req.body.postId);
});

module.exports = app => {
	app.use(express.json());
	app.use(
		"/bookmarks",
		passport.authenticate("jwt", { session: false }),
		router,
		errorHandler
	);
};
