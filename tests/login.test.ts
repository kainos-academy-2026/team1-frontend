import request from 'supertest';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { createApp } from '../src/app';
import type { JobRoleService } from '../src/services/jobRoleService';
import type { LoginServiceClient } from '../src/services/loginService';
import {
	createAuthToken,
	withTestJwtSecret,
} from './helpers/authToken';

describe('Login flow', () => {
	let restoreJwtSecret: () => void;

	const jobRoleService: JobRoleService = {
		getJobRoles: vi.fn(),
		getJobRole: vi.fn(),
	};

	const loginService: LoginServiceClient = {
		login: vi.fn(),
	};

	beforeEach(() => {
		restoreJwtSecret = withTestJwtSecret();
		vi.resetAllMocks();
	});

	afterEach(() => {
		restoreJwtSecret();
	});

	it('renders the login page', async () => {
		const app = createApp(jobRoleService, loginService);
		const response = await request(app).get('/login');

		expect(response.status).toBe(200);
		expect(response.text).toContain('Log in to Kainos Careers');
		expect(response.text).toContain('Login');
	});

	it('shows an error when the email is invalid', async () => {
		const app = createApp(jobRoleService, loginService);
		const response = await request(app)
			.post('/login')
			.send({ email: 'invalid-email', password: 'Password123!' });

		expect(response.status).toBe(400);
		expect(response.text).toContain(
			'Enter a valid email address that includes an @ symbol.',
		);
		expect(response.text).toContain('window.alert');
	});

	it('stores the login token in the rendered page after a successful login', async () => {
		vi.mocked(loginService.login).mockResolvedValue({ token: 'test-token' });

		const app = createApp(jobRoleService, loginService);
		const response = await request(app)
			.post('/login')
			.send({ email: 'test@example.com', password: 'Password123!' });

		expect(response.status).toBe(302);
		expect(response.headers.location).toBe('/job-roles');
		expect(response.headers['set-cookie']?.join(';')).toContain(
			'authSession=test-token',
		);
		expect(loginService.login).toHaveBeenCalledWith({
			email: 'test@example.com',
			password: 'Password123!',
		});
	});

	it('redirects away from login page when already authenticated', async () => {
		const app = createApp(jobRoleService, loginService);
		const response = await request(app)
			.get('/login')
			.set('Cookie', [`authSession=${createAuthToken()}`]);

		expect(response.status).toBe(302);
		expect(response.headers.location).toBe('/job-roles');
	});

	it('shows a login failure message when the service rejects', async () => {
		vi.mocked(loginService.login).mockRejectedValue({
			isAxiosError: true,
			response: {
				status: 401,
				data: { error: 'Invalid email or password' },
			},
		});

		const app = createApp(jobRoleService, loginService);
		const response = await request(app)
			.post('/login')
			.send({ email: 'test@example.com', password: 'WrongPassword!' });

		expect(response.status).toBe(401);
		expect(response.text).toContain(
			'Email or password did not match our records.',
		);
	});

	it('shows an upstream service error when authentication service is unreachable', async () => {
		vi.mocked(loginService.login).mockRejectedValue({
			isAxiosError: true,
			request: {},
		});

		const app = createApp(jobRoleService, loginService);
		const response = await request(app)
			.post('/login')
			.send({ email: 'test@example.com', password: 'Password123!' });

		expect(response.status).toBe(502);
		expect(response.text).toContain(
			'We could not reach the authentication service. Please try again shortly.',
		);
	});

	it('shows backend validation feedback when the service returns a 400 error', async () => {
		vi.mocked(loginService.login).mockRejectedValue({
			isAxiosError: true,
			response: {
				status: 400,
				data: {
					errors: [{ field: 'email', message: 'Email is required' }],
				},
			},
		});

		const app = createApp(jobRoleService, loginService);
		const response = await request(app)
			.post('/login')
			.send({ email: 'test@example.com', password: 'Password123!' });

		expect(response.status).toBe(400);
		expect(response.text).toContain('Email is required');
	});

	it('shows a logout success message when returning with the logout flag', async () => {
		const app = createApp(jobRoleService, loginService);
		const response = await request(app).get('/login?loggedOut=1');

		expect(response.status).toBe(200);
		expect(response.text).toContain(
			'You have successfully logged out. Please log in again.',
		);
	});

	it('clears the auth session cookie and redirects to login on logout', async () => {
		const app = createApp(jobRoleService, loginService);
		const response = await request(app)
			.post('/login/logout')
			.set('Cookie', [`authSession=${createAuthToken()}`]);

		expect(response.status).toBe(302);
		expect(response.headers.location).toBe('/login?loggedOut=1');
		expect(response.headers['set-cookie']?.join(';')).toContain('authSession=;');
	});
});
