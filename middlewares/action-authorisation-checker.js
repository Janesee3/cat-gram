const isUserAuthorisedForAction = (req, res, next) => {
	if (_isUserAuthorised(req.user._id, req.params.id)) {
		next();
	} else {
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

module.exports = isUserAuthorisedForAction;
