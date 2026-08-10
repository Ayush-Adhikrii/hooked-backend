export class AppError extends Error {
	constructor(message, statusCode) {
		super(message);
		this.statusCode = statusCode;
		this.isOperational = true;
		Error.captureStackTrace(this, this.constructor);
	}
}

export class NotFoundError extends AppError {
	constructor(message = "Not found") {
		super(message, 404);
	}
}

export class UnauthorizedError extends AppError {
	constructor(message = "Not authorized") {
		super(message, 401);
	}
}

export class ForbiddenError extends AppError {
	constructor(message = "Forbidden") {
		super(message, 403);
	}
}

export class BadRequestError extends AppError {
	constructor(message = "Bad request") {
		super(message, 400);
	}
}
