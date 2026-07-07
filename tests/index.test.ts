import request from 'supertest';
import { describe, expect, it } from 'vitest';

import { createApp } from '../src/app';
import type { JobRoleService } from '../src/jobRoleService';

describe('GET /', () => {
	it('renders the home page', async () => {
		const jobRoleService: JobRoleService = { getJobRoles: async () => [] };
		const app = createApp(jobRoleService);

		const response = await request(app).get('/');

		expect(response.status).toBe(200);
		expect(response.text).toContain('Hello World');
	});
});
