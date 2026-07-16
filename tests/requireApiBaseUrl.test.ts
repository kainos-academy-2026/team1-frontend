import { afterEach, describe, expect, it } from 'vitest';
import { requireApiBaseUrl } from '../src/config/requireApiBaseUrl';

describe('requireApiBaseUrl', () => {
	const originalApiBaseUrl = process.env.API_BASE_URL;
	const originalNodeEnv = process.env.NODE_ENV;

	afterEach(() => {
		if (typeof originalApiBaseUrl === 'string') {
			process.env.API_BASE_URL = originalApiBaseUrl;
		} else {
			delete process.env.API_BASE_URL;
		}

		if (typeof originalNodeEnv === 'string') {
			process.env.NODE_ENV = originalNodeEnv;
		} else {
			delete process.env.NODE_ENV;
		}
	});

	it('returns API_BASE_URL when it is set', () => {
		process.env.API_BASE_URL = 'https://example.test';

		expect(requireApiBaseUrl()).toBe('https://example.test');
	});

	it('returns test default URL in test environment when API_BASE_URL is missing', () => {
		delete process.env.API_BASE_URL;
		process.env.NODE_ENV = 'test';

		expect(requireApiBaseUrl()).toBe('http://localhost:3001');
	});

	it('throws when API_BASE_URL is missing outside test environment', () => {
		delete process.env.API_BASE_URL;
		process.env.NODE_ENV = 'production';

		expect(() => requireApiBaseUrl()).toThrow(
			'API_BASE_URL is required. Set it in your environment before starting the app.',
		);
	});
});
