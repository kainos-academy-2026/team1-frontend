import request from 'supertest';
import { describe, expect, it } from 'vitest';

import { createApp } from '../src/app';
import type { JobRoleService } from '../src/services/jobRoleService';

describe('GET /', () => {
	it('redirects anonymous users to login', async () => {
		const jobRoleService: JobRoleService = {
			getJobRoles: async (_authToken: string) => [],
			getJobRole: async (_jobRoleId: number, _authToken: string) => null,
		};
		const app = createApp(jobRoleService);

		const response = await request(app).get('/');

		expect(response.status).toBe(302);
		expect(response.headers.location).toBe('/login');
	});

	it('renders the home page for authenticated users', async () => {
		const jobRoleService: JobRoleService = {
			getJobRoles: async (_authToken: string) => [],
			getJobRole: async (_jobRoleId: number, _authToken: string) => null,
		};
		const app = createApp(jobRoleService);

		const response = await request(app)
			.get('/')
			.set('Cookie', ['authSession=token']);

		expect(response.status).toBe(200);
		expect(response.text).toContain('Welcome to Kainos Careers');
	});
});
