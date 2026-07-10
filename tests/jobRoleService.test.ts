import { describe, expect, it, vi } from 'vitest';
import { ValidationError } from '../src/errors/validationError';
import type { JobRole } from '../src/models/jobRole';
import { JobRoleStatus } from '../src/models/jobRoleStatus';
import { ApiJobRoleService } from '../src/services/apiJobRoleService';

describe('ApiJobRoleService', () => {
	it('allows construction when API_BASE_URL is not configured', () => {
		const get = vi.fn();

		expect(
			() =>
				new ApiJobRoleService({
					httpClient: { get } as never,
					apiBaseUrl: undefined,
				}),
		).not.toThrow();
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

	it('maps summary data from the backend list endpoint', async () => {
		const apiRoles = [
			{
				id: 1,
				roleName: 'Software Engineer',
				description: 'Build features that solve customer problems.',
				responsibilities: 'Deliver code, tests, and documentation.',
				sharepointUrl: 'https://sharepoint.example.com/job-specs/1',
				location: 'New York',
				capabilityId: 1,
				capabilityName: 'Workday',
				bandId: 2,
				bandName: 'Senior Associate',
				closingDate: '2024-12-31T00:00:00.000Z',
				status: 'open',
				numberOfOpenPositions: 2,
			},
		];

		const get = vi.fn().mockResolvedValue({ data: apiRoles });
		const service = new ApiJobRoleService({
			httpClient: { get } as never,
			apiBaseUrl: 'http://localhost:3001',
		});

		await expect(service.getJobRoles()).resolves.toEqual([
			{
				jobRoleId: 1,
				roleName: 'Software Engineer',
				description: 'Build features that solve customer problems.',
				responsibilities: 'Deliver code, tests, and documentation.',
				sharepointUrl: 'https://sharepoint.example.com/job-specs/1',
				location: 'New York',
				capabilityId: 1,
				capabilityName: 'Workday',
				bandId: 2,
				bandName: 'Senior Associate',
				closingDate: new Date('2024-12-31T00:00:00.000Z'),
				status: JobRoleStatus.Open,
				numberOfOpenPositions: 2,
			},
		]);
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

		await expect(service.getJobRoles()).rejects.toBeInstanceOf(ValidationError);
		await expect(service.getJobRoles()).rejects.toThrow(
			'Unexpected job role status: draft',
		);
	});

	it('throws ValidationError when list items have no supported identifier', async () => {
		const apiRoles = [
			{
				roleName: 'Software Engineer',
				location: 'Belfast',
				capabilityId: 1,
				bandId: 2,
				closingDate: '2026-08-01',
				status: 'open',
			},
		];

		const get = vi.fn().mockResolvedValue({ data: apiRoles });
		const service = new ApiJobRoleService({
			httpClient: { get } as never,
			apiBaseUrl: 'http://localhost:3001',
		});

		await expect(service.getJobRoles()).rejects.toBeInstanceOf(ValidationError);
		await expect(service.getJobRoles()).rejects.toThrow(
			'Unexpected job role identifier: undefined',
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

	it('throws ValidationError when a required text field is blank', async () => {
		const apiRoles = [
			{
				jobRoleId: 1,
				roleName: 'Software Engineer',
				description: '   ',
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

		const get = vi.fn().mockResolvedValue({ data: apiRoles });
		const service = new ApiJobRoleService({
			httpClient: { get } as never,
			apiBaseUrl: 'http://localhost:3001',
		});

		await expect(service.getJobRoles()).rejects.toBeInstanceOf(ValidationError);
		await expect(service.getJobRoles()).rejects.toThrow(
			'Missing required job role field: description',
		);
	});

	it('returns null when the API returns 404 for a role id', async () => {
		const get = vi
			.fn()
			.mockRejectedValueOnce({
				isAxiosError: true,
				response: { status: 404 },
			})
			.mockResolvedValueOnce({ data: [] });
		const service = new ApiJobRoleService({
			httpClient: { get } as never,
			apiBaseUrl: 'http://localhost:3001',
		});

		await expect(service.getJobRole(999)).resolves.toBeNull();
	});

	it('falls back to the list endpoint when the detail endpoint returns 404', async () => {
		const get = vi
			.fn()
			.mockRejectedValueOnce({
				isAxiosError: true,
				response: { status: 404 },
			})
			.mockResolvedValueOnce({
				data: [
					{
						id: 1,
						roleName: 'Software Engineer',
						description: 'Build features that solve customer problems.',
						responsibilities: 'Deliver code, tests, and documentation.',
						sharepointUrl: 'https://sharepoint.example.com/job-specs/1',
						location: 'New York',
						capabilityId: 1,
						capabilityName: 'Workday',
						bandId: 2,
						bandName: 'Senior Associate',
						closingDate: '2024-12-31T00:00:00.000Z',
						status: 'open',
						numberOfOpenPositions: 2,
					},
				],
			});
		const service = new ApiJobRoleService({
			httpClient: { get } as never,
			apiBaseUrl: 'http://localhost:3001',
		});

		await expect(service.getJobRole(1)).resolves.toEqual({
			jobRoleId: 1,
			roleName: 'Software Engineer',
			description: 'Build features that solve customer problems.',
			responsibilities: 'Deliver code, tests, and documentation.',
			sharepointUrl: 'https://sharepoint.example.com/job-specs/1',
			location: 'New York',
			capabilityId: 1,
			capabilityName: 'Workday',
			bandId: 2,
			bandName: 'Senior Associate',
			closingDate: new Date('2024-12-31T00:00:00.000Z'),
			status: JobRoleStatus.Open,
			numberOfOpenPositions: 2,
		});
		expect(get).toHaveBeenNthCalledWith(1, 'http://localhost:3001/job-roles/1');
		expect(get).toHaveBeenNthCalledWith(2, 'http://localhost:3001/job-roles');
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

		await expect(service.getJobRoles()).rejects.toBeInstanceOf(ValidationError);
		await expect(service.getJobRoles()).rejects.toThrow(
			'Unexpected job role closing date: not-a-date',
		);
	});

	it('throws when detail API returns an insecure sharepoint URL', async () => {
		const apiRole = {
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
		};

		const get = vi.fn().mockResolvedValue({ data: apiRole });
		const service = new ApiJobRoleService({
			httpClient: { get } as never,
			apiBaseUrl: 'http://localhost:3001',
		});

		await expect(service.getJobRole(1)).rejects.toBeInstanceOf(ValidationError);
		await expect(service.getJobRole(1)).rejects.toThrow(
			'sharepointUrl must use HTTPS: javascript:alert(1)',
		);
	});
});
