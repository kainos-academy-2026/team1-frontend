import request from 'supertest';
import { describe, expect, it } from 'vitest';

import { createApp } from '../src/app';
import type { JobRoleService } from '../src/services/jobRoleService';

describe('GET /', () => {
	it('renders the home page', async () => {
		const jobRoleService: JobRoleService = {
			getJobRoles: async () => [],
			getJobRole: async () => null,
		};
		const userService = {
			createUser: async () => undefined,
		};
		const app = createApp(jobRoleService, userService);

		const response = await request(app).get('/');

		expect(response.status).toBe(200);
		expect(response.text).toContain('Welcome to Kainos Careers');
	});
});
