import { describe, expect, it, vi } from 'vitest';
import { ApiJobRoleService } from '../src/apiJobRoleService';
import type { JobRole } from '../src/models/jobRole';
import { JobRoleStatus } from '../src/models/jobRoleStatus';

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
		const apiRoles = [
			{
				jobRoleId: 1,
				roleName: 'Software Engineer',
				description: 'Build features that solve customer problems.',
				responsibilities: 'Deliver code, tests, and documentation.',
				sharepointUrl: 'https://sharepoint.example.com/job-specs/1',
				location: 'Belfast',
				capabilityId: 1,
				capabilityName: 'Workday',
				bandId: 2,
				bandName: 'Senior Associate',
				closingDate: '2026-08-01',
				status: 'open',
				numberOfOpenPositions: 2,
			},
		];

		const expectedRoles: JobRole[] = [
			{
				jobRoleId: 1,
				roleName: 'Software Engineer',
				description: 'Build features that solve customer problems.',
				responsibilities: 'Deliver code, tests, and documentation.',
				sharepointUrl: 'https://sharepoint.example.com/job-specs/1',
				location: 'Belfast',
				capabilityId: 1,
				capabilityName: 'Workday',
				bandId: 2,
				bandName: 'Senior Associate',
				closingDate: new Date('2026-08-01'),
				status: JobRoleStatus.Open,
				numberOfOpenPositions: 2,
			},
		];

		const get = vi.fn().mockResolvedValue({ data: apiRoles });
		const service = new ApiJobRoleService({
			httpClient: { get } as never,
			apiBaseUrl: 'http://localhost:3001',
		});

		await expect(service.getJobRoles()).resolves.toEqual(expectedRoles);
		expect(get).toHaveBeenCalledWith('http://localhost:3001/job-roles');
	});

	it('throws when API returns an unexpected status', async () => {
		const apiRoles = [
			{
				jobRoleId: 1,
				roleName: 'Software Engineer',
				description: 'Build features that solve customer problems.',
				responsibilities: 'Deliver code, tests, and documentation.',
				sharepointUrl: 'https://sharepoint.example.com/job-specs/1',
				location: 'Belfast',
				capabilityId: 1,
				capabilityName: 'Workday',
				bandId: 2,
				bandName: 'Senior Associate',
				closingDate: '2026-08-01',
				status: 'draft',
				numberOfOpenPositions: 2,
			},
		];

		const get = vi.fn().mockResolvedValue({ data: apiRoles });
		const service = new ApiJobRoleService({
			httpClient: { get } as never,
			apiBaseUrl: 'http://localhost:3001',
		});

		await expect(service.getJobRoles()).rejects.toThrow(
			'Unexpected job role status: draft',
		);
	});

	it('returns a detailed job role by id using the injected client', async () => {
		const apiRole = {
			jobRoleId: 1,
			roleName: 'Software Engineer',
			description: 'Build features that solve customer problems.',
			responsibilities: 'Deliver code, tests, and documentation.',
			sharepointUrl: 'https://sharepoint.example.com/job-specs/1',
			location: 'Belfast',
			capabilityId: 1,
			capabilityName: 'Workday',
			bandId: 2,
			bandName: 'Senior Associate',
			closingDate: '2026-08-01',
			status: 'open',
			numberOfOpenPositions: 2,
		};

		const get = vi.fn().mockResolvedValue({ data: apiRole });
		const service = new ApiJobRoleService({
			httpClient: { get } as never,
			apiBaseUrl: 'http://localhost:3001',
		});

		await expect(service.getJobRole(1)).resolves.toEqual({
			...apiRole,
			closingDate: new Date('2026-08-01'),
			status: JobRoleStatus.Open,
		});
		expect(get).toHaveBeenCalledWith('http://localhost:3001/job-roles/1');
	});

	it('returns null when the API returns 404 for a role id', async () => {
		const get = vi.fn().mockRejectedValue({
			isAxiosError: true,
			response: { status: 404 },
		});
		const service = new ApiJobRoleService({
			httpClient: { get } as never,
			apiBaseUrl: 'http://localhost:3001',
		});

		await expect(service.getJobRole(999)).resolves.toBeNull();
	});

	it('throws when API returns an invalid closing date', async () => {
		const apiRoles = [
			{
				jobRoleId: 1,
				roleName: 'Software Engineer',
				description: 'Build features that solve customer problems.',
				responsibilities: 'Deliver code, tests, and documentation.',
				sharepointUrl: 'https://sharepoint.example.com/job-specs/1',
				location: 'Belfast',
				capabilityId: 1,
				capabilityName: 'Workday',
				bandId: 2,
				bandName: 'Senior Associate',
				closingDate: 'not-a-date',
				status: 'open',
				numberOfOpenPositions: 2,
			},
		];

		const get = vi.fn().mockResolvedValue({ data: apiRoles });
		const service = new ApiJobRoleService({
			httpClient: { get } as never,
			apiBaseUrl: 'http://localhost:3001',
		});

		await expect(service.getJobRoles()).rejects.toThrow(
			'Unexpected job role closing date: not-a-date',
		);
	});

	it('throws when API returns an insecure sharepoint URL', async () => {
		const apiRoles = [
			{
				jobRoleId: 1,
				roleName: 'Software Engineer',
				description: 'Build features that solve customer problems.',
				responsibilities: 'Deliver code, tests, and documentation.',
				sharepointUrl: 'javascript:alert(1)',
				location: 'Belfast',
				capabilityId: 1,
				capabilityName: 'Workday',
				bandId: 2,
				bandName: 'Senior Associate',
				closingDate: '2026-08-01',
				status: 'open',
				numberOfOpenPositions: 2,
			},
		];

		const get = vi.fn().mockResolvedValue({ data: apiRoles });
		const service = new ApiJobRoleService({
			httpClient: { get } as never,
			apiBaseUrl: 'http://localhost:3001',
		});

		await expect(service.getJobRoles()).rejects.toThrow(
			'Unexpected job role sharepointUrl: javascript:alert(1)',
		);
	});
});
