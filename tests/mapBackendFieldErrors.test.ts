import { describe, expect, it } from 'vitest';
import { mapBackendFieldErrors } from '../src/errors/mapBackendFieldErrors';

describe('mapBackendFieldErrors', () => {
	it('returns null when errors are missing', () => {
		expect(mapBackendFieldErrors(undefined)).toBeNull();
	});

	it('returns null when errors array is empty', () => {
		expect(mapBackendFieldErrors([])).toBeNull();
	});

	it('groups messages by field', () => {
		expect(
			mapBackendFieldErrors([
				{ field: 'email', message: 'Email is invalid' },
				{ field: 'email', message: 'Email is required' },
				{ field: 'password', message: 'Password is required' },
			]),
		).toEqual({
			email: ['Email is invalid', 'Email is required'],
			password: ['Password is required'],
		});
	});
});
