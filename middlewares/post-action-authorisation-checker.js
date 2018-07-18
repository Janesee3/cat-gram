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

	if (_isUserAuthorised(req.user._id, post.author)) {
		next();
	} else {
		_fireForbiddenError(next);
	}
};

const _isUserAuthorised = (authId, reqId) => {
	if (!reqId) return false; // authorId could be undefined
	return authId.toString() == reqId.toString();
};

const _fireForbiddenError = next => {
	let error = {
		name: "ForbiddenError",
		message: "This action is forbidden for this user!"
	};
	next(error);
};

module.exports = isUserAuthorisedForPostAction;
