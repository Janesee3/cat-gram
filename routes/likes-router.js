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
	"/likePost",
	isUserAuthorisedForBookmarkAction,
	async (req, res, next) => {
		try {
			let post = await Post.findById(req.body.postId);
			let user = await User.findById(req.body.userId);

			if (!post) return next(getNotFoundError(POST_NOT_FOUND_MSG));

			user = await addPostToLikesAndSave(post, user);
			post = await incrementLikeCountAndSave(post);

			res.json(post);
		} catch (err) {
			next(err);
		}
	}
);

router.post(
	"/unlikePost",
	isUserAuthorisedForBookmarkAction,
	async (req, res, next) => {
		try {
			let post = await Post.findById(req.body.postId);

			if (!post) return next(getNotFoundError(POST_NOT_FOUND_MSG));

            user = await removePostFromLikesAndSave(post, user);
			post = await decrementLikeCountAndSave(post);

			res.json(post);
		} catch (err) {
			next(err);
		}
	}
);

const incrementLikeCountAndSave = async post => {
	post.likes = post.likes + 1;
	return await post.save();
};

const decrementLikeCountAndSave = async post => {
	post.likes = post.likes + 1;
	return await post.save();
};

const addPostToLikesAndSave = async (post, user) => {
	user.likes.push(post._id.toString());
	return await user.save();
};

const removePostFromLikesAndSave = async (post, user) => {
    user.likes = user.likes.filter(id => {
        return id.toString() !== post._id;
    });
    return await user.save();
};

module.exports = app => {
	app.use(express.json());
	app.use(
		"/likes",
		passport.authenticate("jwt", { session: false }),
		router,
		errorHandler
	);
};
