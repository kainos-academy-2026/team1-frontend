import jsonwebtoken from 'jsonwebtoken';

export const TEST_JWT_SECRET = 'test-jwt-secret-at-least-32-characters-long';

export const withTestJwtSecret = (): (() => void) => {
	const originalJwtSecret = process.env.JWT_SECRET;
	process.env.JWT_SECRET = TEST_JWT_SECRET;

	return () => {
		if (typeof originalJwtSecret === 'string') {
			process.env.JWT_SECRET = originalJwtSecret;
			return;
		}

		delete process.env.JWT_SECRET;
	};
};

export const createAuthToken = (
	role: 'admin' | 'applicant' = 'applicant',
	expiresIn: number | `${number}${'s' | 'm' | 'h'}` = '1h',
): string => {
	return jsonwebtoken.sign({ role }, TEST_JWT_SECRET, {
		algorithm: 'HS256',
		expiresIn,
	});
};
