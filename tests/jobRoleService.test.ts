import { describe, expect, it, vi } from 'vitest';
import { ValidationError } from '../src/errors/validationError';
import type { JobRole } from '../src/models/jobRole';
import { JobRoleStatus } from '../src/models/jobRoleStatus';
import { ApiJobRoleService } from '../src/services/apiJobRoleService';

describe('ApiJobRoleService', () => {
	const authToken = 'test-auth-token';

	it('allows construction when an API base URL is injected', () => {
		const get = vi.fn();

		expect(
			() => new ApiJobRoleService({ get } as never, 'http://localhost:3001'),
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
		const service = new ApiJobRoleService(
			{ get } as never,
			'http://localhost:3001',
		);

		await expect(service.getJobRoles(authToken)).resolves.toEqual(
			expectedRoles,
		);
		expect(get).toHaveBeenCalledWith('http://localhost:3001/job-roles', {
			headers: { Authorization: `Bearer ${authToken}` },
		});
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
		const service = new ApiJobRoleService(
			{ get } as never,
			'http://localhost:3001',
		);

		await expect(service.getJobRoles(authToken)).resolves.toEqual([
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
		const service = new ApiJobRoleService(
			{ get } as never,
			'http://localhost:3001',
		);

		await expect(service.getJobRoles(authToken)).rejects.toBeInstanceOf(
			ValidationError,
		);
		await expect(service.getJobRoles(authToken)).rejects.toThrow(
			'Unexpected job role status: draft',
		);
	});

	it('maps status case-insensitively for summary data', async () => {
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
				status: 'OPEN',
				numberOfOpenPositions: 2,
			},
		];

		const get = vi.fn().mockResolvedValue({ data: apiRoles });
		const service = new ApiJobRoleService(
			{ get } as never,
			'http://localhost:3001',
		);

		await expect(service.getJobRoles(authToken)).resolves.toEqual([
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
		]);
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
		const service = new ApiJobRoleService(
			{ get } as never,
			'http://localhost:3001',
		);

		await expect(service.getJobRoles(authToken)).rejects.toBeInstanceOf(
			ValidationError,
		);
		await expect(service.getJobRoles(authToken)).rejects.toThrow(
			'Missing job role ID.',
		);
	});

	it('throws ValidationError when capabilityId is not numeric', async () => {
		const apiRoles = [
			{
				jobRoleId: 1,
				roleName: 'Software Engineer',
				description: 'Build features that solve customer problems.',
				responsibilities: 'Deliver code, tests, and documentation.',
				sharepointUrl: 'https://sharepoint.example.com/job-specs/1',
				location: 'Belfast',
				capabilityId: '1',
				capabilityName: 'Workday',
				bandId: 2,
				bandName: 'Senior Associate',
				closingDate: '2026-08-01',
				status: 'open',
				numberOfOpenPositions: 2,
			},
		];

		const get = vi.fn().mockResolvedValue({ data: apiRoles });
		const service = new ApiJobRoleService(
			{ get } as never,
			'http://localhost:3001',
		);

		await expect(service.getJobRoles(authToken)).rejects.toBeInstanceOf(
			ValidationError,
		);
		await expect(service.getJobRoles(authToken)).rejects.toThrow(
			'Missing required job role field: capabilityId',
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
		const service = new ApiJobRoleService(
			{ get } as never,
			'http://localhost:3001',
		);

		await expect(service.getJobRole(1, authToken)).resolves.toEqual({
			...apiRole,
			closingDate: new Date('2026-08-01'),
			status: JobRoleStatus.Open,
		});
		expect(get).toHaveBeenCalledWith('http://localhost:3001/job-roles/1', {
			headers: { Authorization: `Bearer ${authToken}` },
		});
	});

	it('uses fallback text when optional summary fields are blank', async () => {
		const apiRoles = [
			{
				jobRoleId: 1,
				roleName: 'Software Engineer',
				description: '   ',
				responsibilities: ' ',
				sharepointUrl: 'not-a-url',
				location: 'Belfast',
				capabilityId: 1,
				capabilityName: ' ',
				bandId: 2,
				bandName: ' ',
				closingDate: '2026-08-01',
				status: 'open',
				numberOfOpenPositions: 2,
			},
		];

		const get = vi.fn().mockResolvedValue({ data: apiRoles });
		const service = new ApiJobRoleService(
			{ get } as never,
			'http://localhost:3001',
		);

		await expect(service.getJobRoles(authToken)).resolves.toEqual([
			{
				jobRoleId: 1,
				roleName: 'Software Engineer',
				description: 'Description not available.',
				responsibilities: 'Responsibilities not available.',
				sharepointUrl: 'https://example.com/job-specification',
				location: 'Belfast',
				capabilityId: 1,
				capabilityName: 'Capability 1',
				bandId: 2,
				bandName: 'Band 2',
				closingDate: new Date('2026-08-01'),
				status: JobRoleStatus.Open,
				numberOfOpenPositions: 2,
			},
		]);
	});

	it('returns null when the API returns 404 for a role id', async () => {
		const get = vi
			.fn()
			.mockRejectedValueOnce({
				isAxiosError: true,
				response: { status: 404 },
			})
			.mockResolvedValueOnce({ data: [] });
		const service = new ApiJobRoleService(
			{ get } as never,
			'http://localhost:3001',
		);

		await expect(service.getJobRole(999, authToken)).resolves.toBeNull();
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
		const service = new ApiJobRoleService(
			{ get } as never,
			'http://localhost:3001',
		);

		await expect(service.getJobRole(1, authToken)).resolves.toEqual({
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
		expect(get).toHaveBeenNthCalledWith(
			1,
			'http://localhost:3001/job-roles/1',
			{
				headers: { Authorization: `Bearer ${authToken}` },
			},
		);
		expect(get).toHaveBeenNthCalledWith(2, 'http://localhost:3001/job-roles', {
			headers: { Authorization: `Bearer ${authToken}` },
		});
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
		const service = new ApiJobRoleService(
			{ get } as never,
			'http://localhost:3001',
		);

		await expect(service.getJobRoles(authToken)).rejects.toBeInstanceOf(
			ValidationError,
		);
		await expect(service.getJobRoles(authToken)).rejects.toThrow(
			'Unexpected job role closing date: not-a-date',
		);
	});

	it('falls back when detail API returns an insecure sharepoint URL', async () => {
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
		const service = new ApiJobRoleService(
			{ get } as never,
			'http://localhost:3001',
		);

		await expect(service.getJobRole(1, authToken)).resolves.toEqual({
			jobRoleId: 1,
			roleName: 'Software Engineer',
			description: 'Build features that solve customer problems.',
			responsibilities: 'Deliver code, tests, and documentation.',
			sharepointUrl: 'https://example.com/job-specification',
			location: 'Belfast',
			capabilityId: 1,
			capabilityName: 'Workday',
			bandId: 2,
			bandName: 'Senior Associate',
			closingDate: new Date('2026-08-01'),
			status: JobRoleStatus.Open,
			numberOfOpenPositions: 2,
		});
	});

	it('uses fallback values when detail optional fields are blank', async () => {
		const apiRole = {
			jobRoleId: 1,
			roleName: 'Software Engineer',
			description: ' ',
			responsibilities: ' ',
			sharepointUrl: ' ',
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
		const service = new ApiJobRoleService(
			{ get } as never,
			'http://localhost:3001',
		);

		await expect(service.getJobRole(1, authToken)).resolves.toEqual({
			jobRoleId: 1,
			roleName: 'Software Engineer',
			description: 'Description not available.',
			responsibilities: 'Responsibilities not available.',
			sharepointUrl: 'https://example.com/job-specification',
			location: 'Belfast',
			capabilityId: 1,
			capabilityName: 'Workday',
			bandId: 2,
			bandName: 'Senior Associate',
			closingDate: new Date('2026-08-01'),
			status: JobRoleStatus.Open,
			numberOfOpenPositions: 2,
		});
	});
});
