import { afterEach, describe, expect, it } from 'vitest';
import { TEST_JWT_SECRET, withTestJwtSecret } from './helpers/authToken';

describe('auth token test helper', () => {
	const originalJwtSecret = process.env.JWT_SECRET;

	afterEach(() => {
		if (typeof originalJwtSecret === 'string') {
			process.env.JWT_SECRET = originalJwtSecret;
		} else {
			delete process.env.JWT_SECRET;
		}
	});

	it('restores existing JWT_SECRET value', () => {
		process.env.JWT_SECRET = 'existing-secret';

		const restore = withTestJwtSecret();
		expect(process.env.JWT_SECRET).toBe(TEST_JWT_SECRET);

		restore();
		expect(process.env.JWT_SECRET).toBe('existing-secret');
	});

	it('removes JWT_SECRET when it was originally unset', () => {
		delete process.env.JWT_SECRET;

		const restore = withTestJwtSecret();
		expect(process.env.JWT_SECRET).toBe(TEST_JWT_SECRET);

		restore();
		expect(process.env.JWT_SECRET).toBeUndefined();
	});
});
