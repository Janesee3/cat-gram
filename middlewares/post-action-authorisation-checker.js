const Post = require("../models/Post");

const isUserAuthorisedForPostAction = async (req, res, next) => {
	// need to first fetch the post obj
	let post;
	try {
		post = await Post.findById(req.params.id);
		if (!post) post = {};
	} catch (err) {
		post = {};
	}

	console.log("fetched post object!");
	console.log(post);

	// then we get the author id from this post obj
	let authorId = post._id;

	// authorId could be undefined
	if (_isUserAuthorised(req.user._id, authorId || "")) {
		console.log("AUTHORISED!!");
		next();
	} else {
		console.log("Not auth :((((");
		_fireForbiddenError(next);
	}
};

const _isUserAuthorised = (authId, reqId) => {
	return authId.toString() === reqId.toString();
};

const _fireForbiddenError = next => {
	let error = {
		name: "ForbiddenError",
		message: "This action is forbidden for this user!"
	};
	next(error);
};

module.exports = isUserAuthorisedForPostAction;
