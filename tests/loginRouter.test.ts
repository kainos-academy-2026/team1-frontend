import request from 'supertest';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import app from '../src/app';
import { createAuthToken, withTestJwtSecret } from './helpers/authToken';

const { login } = vi.hoisted(() => ({
	login: vi.fn(),
}));

vi.mock('../src/services/loginService.js', () => ({
	LoginService: class {
		login = login;
	},
}));

describe('Login flow', () => {
	let restoreJwtSecret: () => void;

	beforeEach(() => {
		restoreJwtSecret = withTestJwtSecret();
		vi.resetAllMocks();
	});

	afterEach(() => {
		restoreJwtSecret();
	});

	it('renders the login page', async () => {
		const response = await request(app).get('/auth/login');

		expect(response.status).toBe(200);
		expect(response.text).toContain('Log in to Kainos Careers');
		expect(response.text).toContain('Log in');
	});

	it('shows an error when the email is invalid', async () => {
		const response = await request(app)
			.post('/auth/login')
			.send({ email: 'invalid-email', password: 'Password123!' });

		expect(response.status).toBe(200);
		expect(response.text).toContain('Invalid email address');
	});

	it('sets the auth token cookie after a successful login', async () => {
		const token = createAuthToken();
		login.mockResolvedValue({ token });

		const response = await request(app)
			.post('/auth/login')
			.send({ email: 'test@example.com', password: 'Password123!' });

		expect(response.status).toBe(302);
		expect(response.headers.location).toBe('/');
		expect(
			(response.headers['set-cookie'] as unknown as string[])?.join(';'),
		).toContain(`token=${token}`);
		expect(login).toHaveBeenCalledWith({
			email: 'test@example.com',
			password: 'Password123!',
		});
	});

	it('still renders login when already authenticated', async () => {
		const response = await request(app)
			.get('/auth/login')
			.set('Cookie', [`token=${createAuthToken()}`]);

		expect(response.status).toBe(200);
		expect(response.text).toContain('Log in to Kainos Careers');
	});

	it('shows a login failure message when authentication fails', async () => {
		login.mockResolvedValue(null);
		const response = await request(app)
			.post('/auth/login')
			.send({ email: 'test@example.com', password: 'WrongPassword!' });

		expect(response.status).toBe(200);
		expect(response.text).toContain('Login failed. Please try again.');
	});

	it('shows an upstream service error when authentication service is unreachable', async () => {
		login.mockRejectedValue({
			isAxiosError: true,
			request: {},
		});

		const response = await request(app)
			.post('/auth/login')
			.send({ email: 'test@example.com', password: 'Password123!' });

		expect(response.status).toBe(502);
		expect(response.text).toContain('Upstream API error');
		expect(response.text).toContain('Back to login');
	});

	it('shows a logout success message when returning with the logout flag', async () => {
		const response = await request(app).get('/auth/login?loggedOut=1');

		expect(response.status).toBe(200);
		expect(response.text).toContain(
			'You have successfully logged out. Please log in again.',
		);
	});

	it('clears the auth token cookie and redirects to login on logout', async () => {
		const response = await request(app)
			.post('/auth/logout')
			.set('Cookie', [`token=${createAuthToken()}`]);

		expect(response.status).toBe(302);
		expect(response.headers.location).toBe('/auth/login?loggedOut=1');
		expect(
			(response.headers['set-cookie'] as unknown as string[])?.join(';'),
		).toContain('token=');
	});

	it('always clears cookie when no auth session is present', async () => {
		const response = await request(app).post('/auth/logout');

		expect(response.status).toBe(302);
		expect(response.headers.location).toBe('/auth/login?loggedOut=1');
		expect(
			(response.headers['set-cookie'] as unknown as string[])?.join(';'),
		).toContain('token=');
	});
});
