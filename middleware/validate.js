// Validates req.body against a Zod schema, replacing it with the parsed
// (and stripped-of-unknown-keys) result. On failure, responds 400 with the
// first validation issue instead of letting bad input reach a controller.
export const validate = (schema) => (req, res, next) => {
	const result = schema.safeParse(req.body);
	if (!result.success) {
		const firstIssue = result.error.issues[0];
		return res.status(400).json({
			success: false,
			message: firstIssue ? `${firstIssue.path.join(".")}: ${firstIssue.message}` : "Invalid request body",
		});
	}
	req.body = result.data;
	next();
};
