import request from 'supertest';
import { afterEach, beforeEach, describe, expect, it } from 'vitest';

import { createApp } from '../src/app';
import type { JobRoleService } from '../src/services/jobRoleService';
import { createAuthToken, withTestJwtSecret } from './helpers/authToken';

describe('GET /', () => {
	let restoreJwtSecret: () => void;

	beforeEach(() => {
		restoreJwtSecret = withTestJwtSecret();
	});

	afterEach(() => {
		restoreJwtSecret();
	});

	it('renders the home page for anonymous users', async () => {
		const jobRoleService: JobRoleService = {
			getJobRoles: async (_authToken?: string) => [],
			getJobRole: async (_jobRoleId: number, _authToken: string) => null,
		};
		const app = createApp(jobRoleService);

		const response = await request(app).get('/');

		expect(response.status).toBe(200);
		expect(response.text).toContain('Welcome to Kainos Careers');
		expect(response.text).toContain('href="/login">View applications</a>');
	});

	it('renders the home page for authenticated users', async () => {
		const jobRoleService: JobRoleService = {
			getJobRoles: async (_authToken?: string) => [],
			getJobRole: async (_jobRoleId: number, _authToken: string) => null,
		};
		const app = createApp(jobRoleService);

		const response = await request(app)
			.get('/')
			.set('Cookie', [`authSession=${createAuthToken()}`]);

		expect(response.status).toBe(200);
		expect(response.text).toContain('Welcome to Kainos Careers');
		expect(response.text).toContain('href="/login">View applications</a>');
	});
});
