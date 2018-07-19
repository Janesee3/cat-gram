const errorHandler = (err, req, res, next) => {
	if (err.name === "ValidationError") {
		// will enter here for CastError and ValidatorError (custom, required and unique validators)
		// that occur during operations that involves writing to db
		return res.status(400).json(err.message);
	}

	if (err.name === "BadRequestError") {
		return res.status(400).json(err.message);
	}

	if (err.name === "NotFoundError") {
		return res.status(404).json(err.message);
	}

	if (err.name === "ForbiddenError") {
		return res.status(403).json(err.message);
	}

	if (err.name === "CastError" && err.kind === "ObjectId") {
		return res.status(500).json(err.message);
	}

	next(err);
};

module.exports = errorHandler;
