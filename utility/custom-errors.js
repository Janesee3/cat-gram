const getNotFoundError = message => {
	let error = {
		name: "NotFoundError",
		message: message
	};
	return error;
};

const getForbiddenError = message => {
	let error = {
		name: "ForbiddenError",
		message: message
	};
	return error;
};

module.exports = {
	getNotFoundError,
	getForbiddenError
};
