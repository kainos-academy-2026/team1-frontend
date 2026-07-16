import { describe, expect, it } from 'vitest';
import { mapRegistrationApiError } from '../src/errors/mapRegistrationApiError';

describe('mapRegistrationApiError', () => {
	it('maps 409 responses to an inline email error', () => {
		expect(mapRegistrationApiError(409, {})).toEqual({
			status: 409,
			fieldErrors: { email: ['An account with this email already exists.'] },
			formError: null,
		});
	});

	it('maps 500 responses to a generic form error', () => {
		expect(mapRegistrationApiError(500, {})).toEqual({
			status: 500,
			fieldErrors: null,
			formError: 'Something went wrong, please try again.',
		});
	});

	it('returns null for non-handled status codes', () => {
		expect(mapRegistrationApiError(418, {})).toBeNull();
	});

	it('maps 400 backend validation errors to field errors', () => {
		expect(
			mapRegistrationApiError(400, {
				errors: [{ field: 'email', message: 'Email is required' }],
			}),
		).toEqual({
			status: 400,
			fieldErrors: { email: ['Email is required'] },
			formError: null,
		});
	});

	it('returns null for 400 when backend payload has no valid errors', () => {
		expect(mapRegistrationApiError(400, { errors: [] })).toBeNull();
		expect(mapRegistrationApiError(400, {})).toBeNull();
	});
});
