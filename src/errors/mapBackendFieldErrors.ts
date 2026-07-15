import type { BackendValidationError } from '../models/backendValidation.js';

export type FieldErrors = Record<string, string[]>;

export const mapBackendFieldErrors = (
	errors: BackendValidationError[] | undefined,
): FieldErrors | null => {
	if (!errors || errors.length === 0) {
		return null;
	}

	const fieldErrors: FieldErrors = {};

	for (const error of errors) {
		const existingMessages = fieldErrors[error.field] ?? [];
		existingMessages.push(error.message);
		fieldErrors[error.field] = existingMessages;
	}

	return fieldErrors;
};
