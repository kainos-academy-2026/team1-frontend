import { describe, expect, it, vi } from 'vitest';
import { ApiJobRoleService } from '../src/features/job-roles/apiJobRoleService';
import type { JobRole } from '../src/features/job-roles/models/jobRole';

describe('ApiJobRoleService', () => {
	it('throws when API_BASE_URL is not configured', () => {
		const get = vi.fn();

		expect(
			() =>
				new ApiJobRoleService({
					httpClient: { get } as never,
					apiBaseUrl: undefined,
				}),
		).toThrow('API_BASE_URL is not configured');
		expect(get).not.toHaveBeenCalled();
	});

	it('returns data from the API using the injected client', async () => {
		const roles: JobRole[] = [
			{
				id: 1,
				name: 'Software Engineer',
				location: 'Belfast',
				capability: 'Engineering',
				band: 'Associate',
				closingDate: '2026-08-01',
				status: 'open',
			},
		];

		const get = vi.fn().mockResolvedValue({ data: roles });
		const service = new ApiJobRoleService({
			httpClient: { get } as never,
			apiBaseUrl: 'http://localhost:3001',
		});

		await expect(service.getJobRoles()).resolves.toEqual(roles);
		expect(get).toHaveBeenCalledWith('http://localhost:3001/job-roles');
	});
});
