import request from 'supertest';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import app from '../src/app';
import { createAuthToken, withTestJwtSecret } from './helpers/authToken';

const createTokenWithPayload = (payload: Record<string, unknown>): string => {
	const encode = (value: unknown): string =>
		Buffer.from(JSON.stringify(value)).toString('base64url');

	const header = { alg: 'none', typ: 'JWT' };
	return `${encode(header)}.${encode(payload)}.${Buffer.from('signature').toString('base64url')}`;
};

describe('Authentication and authorisation', () => {
	let restoreJwtSecret: () => void;

	beforeEach(() => {
		restoreJwtSecret = withTestJwtSecret();
	});

	afterEach(() => {
		restoreJwtSecret();
		vi.resetAllMocks();
	});

	describe('Route protection', () => {
		it('allows anonymous users to access the home page', async () => {
			const response = await request(app).get('/');

			expect(response.status).toBe(200);
		});

		it('redirects anonymous users to login when accessing the job role list', async () => {
			const response = await request(app).get('/job-roles');

			expect(response.status).toBe(302);
			expect(response.headers.location).toBe('/auth/login');
		});

		it('redirects anonymous users to login when accessing a job role detail page', async () => {
			const response = await request(app).get('/job-roles/1');

			expect(response.status).toBe(302);
			expect(response.headers.location).toBe('/auth/login');
		});
	});

	describe('Nav state', () => {
		it('shows Login link and no Logout button for anonymous users', async () => {
			const response = await request(app).get('/');

			expect(response.text).toContain('href="/auth/login"');
			expect(response.text).not.toContain('Logout');
		});

		it('shows Logout button and no Login link for authenticated users', async () => {
			const response = await request(app)
				.get('/')
				.set('Cookie', [`token=${createAuthToken('USER')}`]);

			expect(response.text).toContain('Logout');
			expect(response.text).not.toContain('href="/auth/login">Login</a>');
		});

		it('shows Admin badge for admin users', async () => {
			const response = await request(app)
				.get('/')
				.set('Cookie', [`token=${createAuthToken('ADMIN')}`]);

			expect(response.text).toContain('Admin');
			expect(response.text).not.toContain('Applicant');
		});

		it('shows Applicant badge for applicant users', async () => {
			const response = await request(app)
				.get('/')
				.set('Cookie', [`token=${createAuthToken('USER')}`]);

			expect(response.text).toContain('Applicant');
			expect(response.text).not.toContain('Admin');
		});
	});

	describe('Token edge cases', () => {
		it('treats a missing cookie as unauthenticated', async () => {
			const response = await request(app).get('/job-roles/1');

			expect(response.status).toBe(302);
			expect(response.headers.location).toBe('/auth/login');
		});

		it('treats a malformed (non-JWT) cookie value as unauthenticated', async () => {
			const response = await request(app)
				.get('/job-roles/1')
				.set('Cookie', ['token=not-a-valid-jwt']);

			expect(response.status).toBe(302);
			expect(response.headers.location).toBe('/auth/login');
		});

		it('shows authenticated nav state even with an expired-looking token payload', async () => {
			const expiredToken = createAuthToken('USER', -1);
			const response = await request(app)
				.get('/')
				.set('Cookie', [`token=${expiredToken}`]);

			expect(response.status).toBe(200);
			expect(response.text).toContain('Applicant');
		});

		it('falls back to non-admin nav state when token has no role claim', async () => {
			const noRoleToken = createTokenWithPayload({ sub: 'user-123' });
			const response = await request(app)
				.get('/')
				.set('Cookie', [`token=${noRoleToken}`]);

			expect(response.status).toBe(200);
			expect(response.text).toContain('Applicant');
		});
	});
});
