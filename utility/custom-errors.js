const ERR_NOT_FOUND = "NotFoundError";
const ERR_FORBIDDEN = "ForbiddenError";
const ERR_BAD_REQUEST = "BadRequestError";
const ERR_VALIDATION = "ValidationError";

const getNotFoundError = message => {
	let error = {
		name: ERR_NOT_FOUND,
		message: message
	};
	return error;
};

const getForbiddenError = message => {
	let error = {
		name: ERR_FORBIDDEN,
		message: message
	};
	return error;
};

const getBadRequestError = message => {
	let error = {
		name: ERR_BAD_REQUEST,
		message: message
	};
	return error;
};

const getValidationError = message => {
	let error = {
		name: ERR_VALIDATION,
		message: message
	};
	return error;
};

module.exports = {
	getNotFoundError,
	getForbiddenError,
	getBadRequestError,
	getValidationError,
	ERR_NOT_FOUND,
	ERR_FORBIDDEN,
	ERR_BAD_REQUEST,
	ERR_VALIDATION
};
