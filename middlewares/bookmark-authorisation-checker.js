const { getForbiddenError } = require('../utility/custom-errors');

// expected req.body: { postId, userId }
const isUserAuthorisedForBookmarkAction = async (req, res, next) => {
	if (_isUserAuthorised(req.user._id, req.body.userId)) {
		next();
	} else {
		next(getForbiddenError("Cannot edit bookmark list for another user!"));
	}
};

const _isUserAuthorised = (authId, reqId) => {
	if (!reqId) return false; // this could be undefined
	return authId.toString() == reqId.toString(); // Need to convert from ObjectId to String
};

module.exports = isUserAuthorisedForBookmarkAction;
