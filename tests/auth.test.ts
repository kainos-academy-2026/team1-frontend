import request from 'supertest';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { createApp } from '../src/app';
import type { JobRoleService } from '../src/services/jobRoleService';
import type { LoginServiceClient } from '../src/services/loginService';
import {
	TEST_JWT_SECRET,
	createAuthToken,
	withTestJwtSecret,
} from './helpers/authToken';
import jsonwebtoken from 'jsonwebtoken';

describe('Authentication and authorisation', () => {
	let restoreJwtSecret: () => void;

	const getJobRoles = vi.fn();
	const getJobRole = vi.fn();
	const jobRoleService: JobRoleService = { getJobRoles, getJobRole };
	const loginService: LoginServiceClient = { login: vi.fn() };

	beforeEach(() => {
		restoreJwtSecret = withTestJwtSecret();
		getJobRoles.mockResolvedValue([]);
		getJobRole.mockResolvedValue(null);
	});

	afterEach(() => {
		restoreJwtSecret();
		vi.resetAllMocks();
	});

	describe('Route protection', () => {
		it('allows anonymous users to access the home page', async () => {
			const app = createApp(jobRoleService, loginService);
			const response = await request(app).get('/');

			expect(response.status).toBe(200);
		});

		it('allows anonymous users to access the job role list', async () => {
			const app = createApp(jobRoleService, loginService);
			const response = await request(app).get('/job-roles');

			expect(response.status).toBe(200);
		});

		it('redirects anonymous users to login when accessing a job role detail page', async () => {
			const app = createApp(jobRoleService, loginService);
			const response = await request(app).get('/job-roles/1');

			expect(response.status).toBe(302);
			expect(response.headers.location).toBe('/login');
		});

		it('allows authenticated users to access a job role detail page', async () => {
			const app = createApp(jobRoleService, loginService);
			const response = await request(app)
				.get('/job-roles/1')
				.set('Cookie', [`authSession=${createAuthToken()}`]);

			expect(response.status).toBe(404);
		});

		it('redirects authenticated users away from the login page', async () => {
			const app = createApp(jobRoleService, loginService);
			const response = await request(app)
				.get('/login')
				.set('Cookie', [`authSession=${createAuthToken()}`]);

			expect(response.status).toBe(302);
			expect(response.headers.location).toBe('/job-roles');
		});
	});

	describe('Nav state', () => {
		it('shows Login link and no Logout button for anonymous users', async () => {
			const app = createApp(jobRoleService, loginService);
			const response = await request(app).get('/');

			expect(response.text).toContain('href="/login"');
			expect(response.text).not.toContain('Logout');
		});

		it('shows Logout button and no Login link for authenticated users', async () => {
			const app = createApp(jobRoleService, loginService);
			const response = await request(app)
				.get('/')
				.set('Cookie', [`authSession=${createAuthToken('applicant')}`]);

			expect(response.text).toContain('Logout');
			expect(response.text).not.toContain('href="/login"');
		});

		it('shows Admin badge for admin users', async () => {
			const app = createApp(jobRoleService, loginService);
			const response = await request(app)
				.get('/')
				.set('Cookie', [`authSession=${createAuthToken('admin')}`]);

			expect(response.text).toContain('Admin');
			expect(response.text).not.toContain('Applicant');
		});

		it('shows Applicant badge for applicant users', async () => {
			const app = createApp(jobRoleService, loginService);
			const response = await request(app)
				.get('/')
				.set('Cookie', [`authSession=${createAuthToken('applicant')}`]);

			expect(response.text).toContain('Applicant');
			expect(response.text).not.toContain('Admin');
		});
	});

	describe('Token edge cases', () => {
		it('treats a missing cookie as unauthenticated', async () => {
			const app = createApp(jobRoleService, loginService);
			const response = await request(app).get('/job-roles/1');

			expect(response.status).toBe(302);
			expect(response.headers.location).toBe('/login');
		});

		it('treats a malformed (non-JWT) cookie value as unauthenticated', async () => {
			const app = createApp(jobRoleService, loginService);
			const response = await request(app)
				.get('/job-roles/1')
				.set('Cookie', ['authSession=not-a-valid-jwt']);

			expect(response.status).toBe(302);
			expect(response.headers.location).toBe('/login');
		});

		it('treats an expired token as unauthenticated', async () => {
			const expiredToken = jsonwebtoken.sign(
				{ role: 'applicant' },
				TEST_JWT_SECRET,
				{ expiresIn: -1 },
			);

			const app = createApp(jobRoleService, loginService);
			const response = await request(app)
				.get('/job-roles/1')
				.set('Cookie', [`authSession=${expiredToken}`]);

			expect(response.status).toBe(302);
			expect(response.headers.location).toBe('/login');
		});

		it('treats a token with no recognised role claim as unauthenticated', async () => {
			const noRoleToken = jsonwebtoken.sign(
				{ sub: 'user-123' },
				TEST_JWT_SECRET,
				{ expiresIn: '1h' },
			);

			const app = createApp(jobRoleService, loginService);
			const response = await request(app)
				.get('/job-roles/1')
				.set('Cookie', [`authSession=${noRoleToken}`]);

			expect(response.status).toBe(302);
			expect(response.headers.location).toBe('/login');
		});
	});
});
