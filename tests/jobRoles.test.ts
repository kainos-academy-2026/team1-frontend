import request from 'supertest';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { app } from '../src/app';
import * as jobRoleService from '../src/jobRoleService';

vi.mock('../src/jobRoleService');

describe('GET /job-roles', () => {
	beforeEach(() => {
		vi.resetAllMocks();
	});

	it('renders a list of open job roles', async () => {
		vi.mocked(jobRoleService.getJobRoles).mockResolvedValue([
			{ id: 1, name: 'Software Engineer', status: 'open' },
		]);

		const response = await request(app).get('/job-roles');

		expect(response.status).toBe(200);
		expect(response.text).toContain('Software Engineer');
	});

	it('returns 500 when the service throws an error', async () => {
		vi.mocked(jobRoleService.getJobRoles).mockRejectedValue(new Error('API error'));

		const response = await request(app).get('/job-roles');

		expect(response.status).toBe(500);
	});
});
