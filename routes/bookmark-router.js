const express = require("express");
const { passport } = require("../config/passport");
const {
	getNotFoundError,
	getBadRequestError
} = require("../utility/custom-errors");
const errorHandler = require("../middlewares/error-handler");
const isUserAuthorisedForBookmarkAction = require("../middlewares/bookmark-authorisation-checker");
const Post = require("../models/Post");
const User = require("../models/User");

const POST_NOT_FOUND_MSG = "No such post exists!";
const POST_NOT_BOOKMARKED_MSG = "Cannot find post in user's bookmarked list!";

const router = express.Router();

router.post("/addToBookmarks", async (req, res, next) => {
	try {
		let post = await Post.findById(req.body.postId);
		let user = await User.findById(req.user._id);

		if (!post) return next(getNotFoundError(POST_NOT_FOUND_MSG));

		user = await addPostToBookmarksAndSave(post, user);
		res.json(user.toDisplay());
	} catch (err) {
		next(err);
	}
});

router.post("/removeFromBookmarks", async (req, res, next) => {
	try {
		let post = await Post.findById(req.body.postId);
		let user = await User.findById(req.user._id);

		if (!post) return next(getNotFoundError(POST_NOT_FOUND_MSG));

		if (!hasUserBookmarkedPost(post, user)) {
			return next(getBadRequestError(POST_NOT_BOOKMARKED_MSG));
		}

		user = await removePostFromBookmarksAndSave(post, user);
		res.json(user.toDisplay());
	} catch (err) {
		next(err);
	}
});

const addPostToBookmarksAndSave = async (post, user) => {
	user.bookmarked.push(post._id.toString());
	return await user.save();
};

const removePostFromBookmarksAndSave = async (post, user) => {
	user.bookmarked = user.bookmarked.filter(bookmarkId => {
		return bookmarkId.toString() !== post._id.toString();
	});
	return await user.save();
};

const hasUserBookmarkedPost = (post, user) => {
	let bookmarkArr = user.bookmarked.map(postId => postId.toString());
	return bookmarkArr.includes(post._id.toString());
};

module.exports = app => {
	app.use(express.json());
	app.use(
		"/bookmarks",
		passport.authenticate("jwt", { session: false }),
		router,
		errorHandler
	);
};
