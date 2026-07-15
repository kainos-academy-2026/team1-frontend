import request from 'supertest';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { createApp } from '../src/app';
import type { JobRoleService } from '../src/services/jobRoleService';
import type { LoginServiceClient } from '../src/services/loginService';

const { getJobRoles, getJobRole, createUser } = vi.hoisted(() => ({
	getJobRoles: vi.fn(),
	getJobRole: vi.fn(),
	createUser: vi.fn(),
}));

vi.mock('../src/services/apiUserService.js', () => ({
	ApiUserService: class {
		createUser = createUser;
	},
}));

const jobRoleService: JobRoleService = {
	getJobRoles,
	getJobRole,
};

const loginService: LoginServiceClient = {
	login: vi.fn(),
};

describe('Registration', () => {
	beforeEach(() => {
		vi.resetAllMocks();
		getJobRoles.mockResolvedValue([]);
		getJobRole.mockResolvedValue(null);
	});

	it('renders the registration page', async () => {
		const app = createApp(jobRoleService, loginService);
		const response = await request(app).get('/registration');

		expect(response.status).toBe(200);
		expect(response.text).toContain('Create an account');
	});

	it('creates a user from valid registration data', async () => {
		createUser.mockResolvedValue(undefined);
		const app = createApp(jobRoleService, loginService);

		const response = await request(app)
			.post('/registration')
			.type('form')
			.send({
				email: 'person@example.com',
				password: 'StrongPass!1',
			});

		expect(response.status).toBe(302);
		expect(response.headers.location).toBe('/');
		expect(createUser).toHaveBeenCalledWith({
			email: 'person@example.com',
			password: 'StrongPass!1',
		});
	});

	it('rejects invalid registration data', async () => {
		const app = createApp(jobRoleService, loginService);
		const response = await request(app)
			.post('/registration')
			.type('form')
			.send({
				email: 'invalid-email',
				password: 'weak',
			});

		expect(response.status).toBe(400);
		expect(response.text).toContain(
			'Please enter a valid email address (for example, name@example.com).',
		);
		expect(response.text).toContain(
			'Password must be more than 8 characters and include at least one uppercase letter, one lowercase letter, and one special character.',
		);
		expect(createUser).not.toHaveBeenCalled();
	});

	it('shows an error page when user creation fails', async () => {
		createUser.mockRejectedValue({ isAxiosError: true });
		const app = createApp(jobRoleService, loginService);

		const response = await request(app)
			.post('/registration')
			.type('form')
			.send({
				email: 'person@example.com',
				password: 'StrongPass!1',
			});

		expect(response.status).toBe(502);
		expect(response.text).toContain('Upstream API error');
		expect(response.text).toContain('Back to registration');
		expect(response.text).toContain('href="/registration"');
	});
});
