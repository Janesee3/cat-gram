const errorHandler = (err, req, res, next) => {
	if (err.name === "ValidationError") {
		// will enter here for CastError and ValidatorError (custom, required and unique validators)
		// that occur during operations that involves writing to db
		res.status(400).json(err.message);
		return;
	}

	if (err.name === "NotFoundError") {
		res.status(404).json(err.message);
		return;
	}

	if (err.name === "ForbiddenError") {
		res.status(403).json(err.message);
		return;
	}

	if (err.name === "CastError" && err.kind === "ObjectId") {
		res.status(500).json(err.message);
		return;
	}

	next(err);
};

module.exports = errorHandler;
