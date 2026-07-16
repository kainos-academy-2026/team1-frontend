export const TEST_JWT_SECRET = 'test-jwt-secret-at-least-32-characters-long';

const encodeBase64Url = (value: string): string =>
	Buffer.from(value).toString('base64url');

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
	role: 'ADMIN' | 'USER' = 'USER',
	expiresInSeconds = 3600,
): string => {
	const nowInSeconds = Math.floor(Date.now() / 1000);
	const payload = {
		sub: 'test-user-id',
		email: 'test.user@example.com',
		role,
		iat: nowInSeconds,
		exp: nowInSeconds + expiresInSeconds,
	};

	const header = { alg: 'none', typ: 'JWT' };
	return `${encodeBase64Url(JSON.stringify(header))}.${encodeBase64Url(JSON.stringify(payload))}.${encodeBase64Url('signature')}`;
};
