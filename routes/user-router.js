const express = require("express");
const { passport } = require("../config/passport");
const User = require("../models/User");
const Post = require("../models/Post");
const errorHandler = require("../middlewares/error-handler");
const isUserAuthorisedForAction = require("../middlewares/user-action-authorisation-checker");
const { getNotFoundError } = require('../utility/custom-errors');

const ERR_USER_NOT_FOUND_MSG = "Cannot find user with this id!";
const unprotectedRoutes = express.Router();

unprotectedRoutes.get("/", async (req, res, next) => {
	try {
		let users = await User.find().populate("bookmarked");

		let promises = users.map(user => {
			return _getJointUserAndPosts(user);
		});
		let results = await Promise.all(promises);

		res.json(results);
	} catch (err) {
		next(err);
	}
});

unprotectedRoutes.get("/:id", async (req, res, next) => {
	try {
		let user = await User.findById(req.params.id).populate("bookmarked");
		if (!user) return next(getNotFoundError(ERR_USER_NOT_FOUND_MSG));
		res.json(await _getJointUserAndPosts(user));
	} catch (err) {
		next(err);
	}
});

const protectedRoutes = express.Router();

protectedRoutes.put(
	"/:id",
	isUserAuthorisedForAction,
	async (req, res, next) => {
		try {
			let user = await User.findByIdAndUpdate(req.params.id, req.body, {
				new: true
			});
			if (!user) return next(getNotFoundError(ERR_USER_NOT_FOUND_MSG));
			res.json(await _getJointUserAndPosts(user));
		} catch (err) {
			next(err);
		}
	}
);

protectedRoutes.delete(
	"/:id",
	isUserAuthorisedForAction,
	async (req, res, next) => {
		try {
			let user = await User.findByIdAndDelete(req.params.id);
			if (!user) return next(getNotFoundError(ERR_USER_NOT_FOUND_MSG));
			res.json({
				message: `Successfully deleted user with ID ${req.params.id}.`
			});
		} catch (err) {
			next(err);
		}
	}
);

const _getJointUserAndPosts = async user => {
	let posts = await Post.find({ author: user._id });
	return { ...user.toJSON(), posts: posts };
};

module.exports = app => {
	app.use(express.json());
	app.use("/users", unprotectedRoutes, errorHandler);
	app.use(
		"/users",
		passport.authenticate("jwt", { session: false }),
		protectedRoutes,
		errorHandler
	);
};
