import request from 'supertest';
import { beforeEach, describe, expect, it, vi } from 'vitest';

const { login } = vi.hoisted(() => ({
	login: vi.fn(),
}));

vi.mock('../src/services/apiJobRoleService.js', () => ({
	ApiJobRoleService: class {
		getJobRoles = vi.fn();
		getJobRole = vi.fn();
	},
}));

vi.mock('../src/services/loginService.js', () => ({
	LoginService: class {
		login = login;
	},
}));

import app from '../src/app';

describe('Login flow', () => {
	beforeEach(() => {
		vi.resetAllMocks();
	});

	it('renders the login page', async () => {
		const response = await request(app).get('/login');

		expect(response.status).toBe(200);
		expect(response.text).toContain('Log in to Kainos Careers');
		expect(response.text).toContain('Login');
	});

	it('shows an error when the email is invalid', async () => {
		const response = await request(app)
			.post('/login')
			.send({ email: 'invalid-email', password: 'Password123!' });

		expect(response.status).toBe(400);
		expect(response.text).toContain('Invalid email address');
	});

	it('stores the login token in the rendered page after a successful login', async () => {
		login.mockResolvedValue({ token: 'test-token' });

		const response = await request(app)
			.post('/login')
			.send({ email: 'test@example.com', password: 'Password123!' });

		expect(response.status).toBe(200);
		expect(response.text).toContain(
			"sessionStorage.setItem('loginToken', 'test-token')",
		);
		expect(response.text).toContain("window.location.href = '/';");
		expect(login).toHaveBeenCalledWith({
			email: 'test@example.com',
			password: 'Password123!',
		});
	});

	it('shows a login failure message when the service rejects', async () => {
		login.mockRejectedValue({
			isAxiosError: true,
			response: {
				status: 401,
				data: { error: 'Invalid email or password' },
			},
		});

		const response = await request(app)
			.post('/login')
			.send({ email: 'test@example.com', password: 'WrongPassword!' });

		expect(response.status).toBe(401);
		expect(response.text).toContain(
			'Email or password did not match our records.',
		);
	});

	it('shows backend validation feedback when the service returns a 400 error', async () => {
		login.mockRejectedValue({
			isAxiosError: true,
			response: {
				status: 400,
				data: {
					errors: [{ field: 'email', message: 'Email is required' }],
				},
			},
		});

		const response = await request(app)
			.post('/login')
			.send({ email: 'test@example.com', password: 'Password123!' });

		expect(response.status).toBe(400);
		expect(response.text).toContain('Email is required');
	});

	it('shows a logout success message when returning with the logout flag', async () => {
		const response = await request(app).get('/login?loggedOut=1');

		expect(response.status).toBe(200);
		expect(response.text).toContain(
			'You have successfully logged out. Please log in again.',
		);
	});
});
