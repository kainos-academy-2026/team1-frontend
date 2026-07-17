import type { RequestHandler } from 'express';
import type { ZodSchema, ZodType } from 'zod';

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

export function validateBody(schema: ZodType): RequestHandler {
	return (req, res, next) => {
		const result = schema.safeParse(req.body ?? {});

		if (!result.success) {
			const fieldErrors: Record<string, string[]> = {};

			for (const issue of result.error.issues) {
				const field = issue.path?.[0];

				if (typeof field !== 'string' || typeof issue.message !== 'string') {
					continue;
				}

				const existingMessages = fieldErrors[field] ?? [];

				if (!existingMessages.includes(issue.message)) {
					existingMessages.push(issue.message);
				}

				fieldErrors[field] = existingMessages;
			}

			res.locals.errors = fieldErrors;
			next();
			return;
		}

		res.locals.errors = null;
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

export function validateQuery(schema: ZodSchema): RequestHandler {
	return (req, res, next) => {
		const result = schema.safeParse(req.query);

		if (!result.success) {
			res.status(400).json({ errors: toErrors(result.error.issues) });
			return;
		}

		Object.assign(req.query, result.data);
		next();
	};
}
