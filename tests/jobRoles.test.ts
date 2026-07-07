import request from 'supertest';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { createApp } from '../src/app';
import type { JobRoleService } from '../src/features/job-roles/jobRoleService';

describe('GET /job-roles', () => {
	const getJobRoles = vi.fn();
	const jobRoleService: JobRoleService = { getJobRoles };

	beforeEach(() => {
		vi.resetAllMocks();
	});

	it('renders a list of open job roles', async () => {
		getJobRoles.mockResolvedValue([
			{
				id: 1,
				name: 'Software Engineer',
				location: 'Belfast',
				capability: 'Engineering',
				band: 'Associate',
				closingDate: '2026-08-01',
				status: 'open',
			},
		]);

		const app = createApp(jobRoleService);
		const response = await request(app).get('/job-roles');

		expect(response.status).toBe(200);
		expect(response.text).toContain('Software Engineer');
		expect(response.text).toContain('Belfast');
		expect(response.text).toContain('Engineering');
		expect(response.text).toContain('Associate');
		expect(response.text).toContain('2026-08-01');
	});

	it('returns 500 when the service throws an error', async () => {
		getJobRoles.mockRejectedValue(new Error('API error'));

		const app = createApp(jobRoleService);
		const response = await request(app).get('/job-roles');

		expect(response.status).toBe(500);
	});

	it('renders an empty state when no job roles are returned', async () => {
		getJobRoles.mockResolvedValue([]);

		const app = createApp(jobRoleService);
		const response = await request(app).get('/job-roles');

		expect(response.status).toBe(200);
		expect(response.text).toContain('No job roles are currently available.');
	});
});
