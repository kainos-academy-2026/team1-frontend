import request from 'supertest';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { createApp } from '../src/app';
import type { JobRoleService } from '../src/services/jobRoleService';
import type { UserService } from '../src/services/userService';

describe('Registration', () => {
	const getJobRoles = vi.fn();
	const getJobRole = vi.fn();
	const createUser = vi.fn();

	const jobRoleService: JobRoleService = {
		getJobRoles,
		getJobRole,
	};

	const userService: UserService = {
		createUser,
	};

	beforeEach(() => {
		vi.resetAllMocks();
		getJobRoles.mockResolvedValue([]);
		getJobRole.mockResolvedValue(null);
	});

	it('renders the registration page', async () => {
		const app = createApp(jobRoleService, userService);

		const response = await request(app).get('/registration');

		expect(response.status).toBe(200);
		expect(response.text).toContain('Create an account');
	});

	it('creates a user from valid registration data', async () => {
		createUser.mockResolvedValue(undefined);

		const app = createApp(jobRoleService, userService);

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
		const app = createApp(jobRoleService, userService);

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
});
