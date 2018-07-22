const {
	ERR_BAD_REQUEST,
	ERR_FORBIDDEN,
	ERR_NOT_FOUND,
	ERR_VALIDATION
} = require("../utility/custom-errors");

const errorHandler = (err, req, res, next) => {
	if (err.name === ERR_VALIDATION) {
		// will enter here for CastError and ValidatorError (custom, required and unique validators)
		// that occur during operations that involves writing to db
		return res.status(400).json(err.message);
	}

	if (err.name === ERR_BAD_REQUEST) {
		return res.status(400).json(err.message);
	}

	if (err.name === ERR_NOT_FOUND) {
		return res.status(404).json(err.message);
	}

	if (err.name === ERR_FORBIDDEN) {
		return res.status(403).json(err.message);
	}

	if (err.name === "CastError" && err.kind === "ObjectId") {
		return res.status(500).json(err.message);
	}

	next(err);
};

module.exports = errorHandler;
