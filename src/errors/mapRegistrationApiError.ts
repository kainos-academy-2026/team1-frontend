import type { BackendValidationError } from '../models/backendValidation.js';
import {
	type FieldErrors,
	mapBackendFieldErrors,
} from './mapBackendFieldErrors.js';

export interface RegistrationApiErrorResult {
	status: number;
	fieldErrors: FieldErrors | null;
	formError: string | null;
}

export const mapRegistrationApiError = (
	status: number | undefined,
	responseData: unknown,
): RegistrationApiErrorResult | null => {
	if (status === 409) {
		return {
			status: 409,
			fieldErrors: {
				email: ['An account with this email already exists.'],
			},
			formError: null,
		};
	}

	if (status === 500) {
		return {
			status: 500,
			fieldErrors: null,
			formError: 'Something went wrong, please try again.',
		};
	}

	if (status !== 400) {
		return null;
	}

	const backendErrors = (responseData as { errors?: BackendValidationError[] })
		?.errors;
	const fieldErrors = mapBackendFieldErrors(backendErrors);

	if (!fieldErrors) {
		return null;
	}

	return {
		status: 400,
		fieldErrors,
		formError: null,
	};
};
