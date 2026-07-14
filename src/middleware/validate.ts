import type { RequestHandler } from 'express';
import type { ZodSchema } from 'zod';

interface ValidationError {
	field: string;
	message: string;
}

function toErrors(
	issues: { path: PropertyKey[]; message: string }[],
): ValidationError[] {
	return issues.map((issue) => ({
		field: issue.path.map((part) => String(part)).join('.'),
		message: issue.message,
	}));
}

export function validateBody(schema: ZodSchema): RequestHandler {
	return (req, res, next) => {
		const result = schema.safeParse(req.body);

		if (!result.success) {
			res.status(400).json({ errors: toErrors(result.error.issues) });
			return;
		}

		req.body = result.data as typeof req.body;
		next();
	};
}

export function validateParams(schema: ZodSchema): RequestHandler {
	return (req, res, next) => {
		const result = schema.safeParse(req.params);

		if (!result.success) {
			res.status(400).json({ errors: toErrors(result.error.issues) });
			return;
		}

		req.params = result.data as typeof req.params;
		next();
	};
}
