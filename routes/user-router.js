const express = require("express");
const { passport } = require("../config/passport");
const User = require("../models/User");
const Post = require("../models/Post");
const errorHandler = require("../middlewares/mongoose-error-handler");

const unprotectedRoutes = express.Router();

unprotectedRoutes.get("/", async (req, res, next) => {
	try {
		let users = await User.find();

		let promises = users.map(async user => {
			// will return an array of promises
			return await getJointUserAndPosts(user);
		});

		let results = await Promise.all(promises);
		res.json(results);
	} catch (err) {
		next(err);
	}
});

unprotectedRoutes.get("/:id", async (req, res, next) => {
	try {
		let user = await User.findById(req.params.id);
		if (!user) return fireNotFoundError(res, next);
		res.json(await getJointUserAndPosts(user));
	} catch (err) {
		next(err);
	}
});

unprotectedRoutes.post("/signup", async (req, res, next) => {
	const { username, password } = req.body;

	if (!password) {
		let error = { name: "ValidationError", message: "password is required!" };
		next(error);
		return;
	}

	const user = new User({ username });
	user.setHashedPassword(password);

	try {
		await user.save();
		res.json({ user });
	} catch (err) {
		next(err);
	}
});

const protectedRoutes = express.Router();

protectedRoutes.put("/:id", async (req, res, next) => {
	try {
		let user = await User.findByIdAndUpdate(req.params.id, req.body, {
			new: true
		});
		if (!user) return fireNotFoundError(res, next);
		res.json(await getJointUserAndPosts(user));
	} catch (err) {
		next(err);
	}
});

protectedRoutes.delete("/:id", async (req, res, next) => {
	try {
		let user = await User.findByIdAndDelete(req.params.id);
		if (!user) return fireNotFoundError(res, next);
		res.json({
			message: `Successfully deleted user with ID ${req.params.id}.`
		});
	} catch (err) {
		next(err);
	}
});


const getJointUserAndPosts = async user => {
	let posts = await Post.find({ author: user._id });
	let newUser = { ...user.toJSON(), posts: posts };
	return newUser;
};

const fireNotFoundError = (res, next) => {
	let error = {
		name: "NotFoundError",
		message: "Cannot find user with this id!"
	};
	next(error);
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
