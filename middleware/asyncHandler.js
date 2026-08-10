// Wraps an async route handler so a rejected promise (or thrown error) is
// forwarded to Express's error-handling middleware instead of hanging the
// request or crashing the process as an unhandled rejection.
const asyncHandler = (fn) => (req, res, next) => {
	Promise.resolve(fn(req, res, next)).catch(next);
};

export default asyncHandler;
