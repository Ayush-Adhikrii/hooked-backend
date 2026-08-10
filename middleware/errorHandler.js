// Final Express error-handling middleware. Anything that reaches here is
// either a known AppError (thrown deliberately) or an unexpected failure
// (a rejected promise not already handled by a controller's own try/catch,
// a Mongoose error, a JWT error, etc.) - this is the safety net that stops
// an unhandled rejection from hanging a request or crashing the process.
const errorHandler = (err, req, res, next) => {
	let statusCode = err.statusCode || 500;
	let message = err.message || "Internal server error";

	if (err.name === "ValidationError") {
		statusCode = 400;
		message = Object.values(err.errors)
			.map((e) => e.message)
			.join(", ");
	} else if (err.name === "CastError") {
		statusCode = 400;
		message = `Invalid ${err.path}`;
	} else if (err.code === 11000) {
		statusCode = 400;
		const field = Object.keys(err.keyPattern || {})[0] || "field";
		message = `${field} is already in use`;
	} else if (err.name === "JsonWebTokenError" || err.name === "TokenExpiredError") {
		statusCode = 401;
		message = "Not authorized - invalid or expired token";
	}

	if (!err.isOperational && statusCode === 500) {
		console.error("Unexpected error:", err);
	}

	res.status(statusCode).json({ success: false, message });
};

export default errorHandler;
