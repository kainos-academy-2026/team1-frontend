import { describe, expect, it, vi } from 'vitest';
import type { JobRole } from '../src/models/jobRole';
import { JobRoleStatus } from '../src/models/jobRoleStatus';
import { ApiJobRoleService } from '../src/services/apiJobRoleService';

describe('ApiJobRoleService', () => {
	const authToken = 'test-auth-token';

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
		const service = new ApiJobRoleService({ get } as never);

		await expect(service.getJobRoles(authToken)).resolves.toEqual(
			expectedRoles,
		);
		expect(get).toHaveBeenCalledWith('/job-roles', {
			headers: { Authorization: `Bearer ${authToken}` },
		});
	});

	it('omits authorization header when auth token is blank', async () => {
		const get = vi.fn().mockResolvedValue({ data: [] });
		const service = new ApiJobRoleService({ get } as never);

		await expect(service.getJobRoles('   ')).resolves.toEqual([]);
		expect(get).toHaveBeenCalledWith('/job-roles', {
			headers: {},
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
		const service = new ApiJobRoleService({ get } as never);

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

	it('maps summary data when backend uses specification field for URLs', async () => {
		const apiRoles = [
			{
				id: 3,
				roleName: 'Product Manager',
				description: 'Lead product development and strategy.',
				responsibilities: 'Define product vision, strategy, and roadmap.',
				specification:
					'https://kainossoftwareltd.sharepoint.com/sites/Career/JobProfiles/Product/Job%20Profile%20-%20Product%20Consultant%20(Manager).pdf',
				location: 'Chicago',
				capabilityId: 3,
				bandId: 3,
				closingDate: '2024-10-31T00:00:00.000Z',
				status: 'closed',
				numberOfOpenPositions: 1,
			},
		];

		const get = vi.fn().mockResolvedValue({ data: apiRoles });
		const service = new ApiJobRoleService({ get } as never);

		await expect(service.getJobRoles(authToken)).resolves.toEqual([
			{
				jobRoleId: 3,
				roleName: 'Product Manager',
				description: 'Lead product development and strategy.',
				responsibilities: 'Define product vision, strategy, and roadmap.',
				sharepointUrl:
					'https://kainossoftwareltd.sharepoint.com/sites/Career/JobProfiles/Product/Job%20Profile%20-%20Product%20Consultant%20(Manager).pdf',
				location: 'Chicago',
				capabilityId: 3,
				capabilityName: undefined,
				bandId: 3,
				bandName: undefined,
				closingDate: new Date('2024-10-31T00:00:00.000Z'),
				status: JobRoleStatus.Closed,
				numberOfOpenPositions: 1,
			},
		]);
	});

	it('maps unexpected status values as-is since mappers do not validate', async () => {
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
		const service = new ApiJobRoleService({ get } as never);

		const result = await service.getJobRoles(authToken);
		expect(result[0].status).toBe('draft');
	});

	it('maps non-string status values as-is since mappers do not validate', async () => {
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
				status: null,
				numberOfOpenPositions: 2,
			},
		];

		const get = vi.fn().mockResolvedValue({ data: apiRoles });
		const service = new ApiJobRoleService({ get } as never);

		const result = await service.getJobRoles(authToken);
		expect(result[0].status).toBe(null);
	});

	it('maps status value as-is for summary data', async () => {
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
		const service = new ApiJobRoleService({ get } as never);

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
				status: 'OPEN',
				numberOfOpenPositions: 2,
			},
		]);
	});

	it('maps missing identifier as-is since mappers do not validate', async () => {
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
		const service = new ApiJobRoleService({ get } as never);

		const result = await service.getJobRoles(authToken);
		expect(result[0].jobRoleId).toBeUndefined();
	});

	it('maps non-numeric capabilityId as-is since mappers do not validate', async () => {
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
		const service = new ApiJobRoleService({ get } as never);

		const result = await service.getJobRoles(authToken);
		expect(result[0].capabilityId).toBe('1');
	});

	it('maps non-string roleName as-is since mappers do not validate', async () => {
		const apiRoles = [
			{
				jobRoleId: 1,
				roleName: null,
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

		const get = vi.fn().mockResolvedValue({ data: apiRoles });
		const service = new ApiJobRoleService({ get } as never);

		const result = await service.getJobRoles(authToken);
		expect(result[0].roleName).toBe(null);
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
		const service = new ApiJobRoleService({ get } as never);

		await expect(service.getJobRole('1', authToken)).resolves.toEqual({
			...apiRole,
			closingDate: new Date('2026-08-01'),
			status: JobRoleStatus.Open,
		});
		expect(get).toHaveBeenCalledWith('/job-roles/1', {
			headers: { Authorization: `Bearer ${authToken}` },
		});
	});

	it('maps optional summary fields as-is when blank', async () => {
		const apiRoles = [
			{
				jobRoleId: 1,
				roleName: 'Software Engineer',
				description: '   ',
				responsibilities: ' ',
				sharepointUrl: 'https://sharepoint.example.com/job-specs/1',
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
		const service = new ApiJobRoleService({ get } as never);

		await expect(service.getJobRoles(authToken)).resolves.toEqual([
			{
				jobRoleId: 1,
				roleName: 'Software Engineer',
				description: '   ',
				responsibilities: ' ',
				sharepointUrl: 'https://sharepoint.example.com/job-specs/1',
				location: 'Belfast',
				capabilityId: 1,
				capabilityName: ' ',
				bandId: 2,
				bandName: ' ',
				closingDate: new Date('2026-08-01'),
				status: JobRoleStatus.Open,
				numberOfOpenPositions: 2,
			},
		]);
	});

	it('maps invalid sharepoint URL value as-is for summary rows', async () => {
		const apiRoles = [
			{
				jobRoleId: 1,
				roleName: 'Software Engineer',
				description: 'Build features that solve customer problems.',
				responsibilities: 'Deliver code, tests, and documentation.',
				sharepointUrl: 'not-a-url',
				location: 'Belfast',
				capabilityId: 1,
				capabilityName: 'Workday',
				bandId: 2,
				bandName: 'Senior Associate',
				closingDate: '2026-08-01',
				status: 'open',
				numberOfOpenPositions: 2,
			},
			{
				jobRoleId: 2,
				roleName: 'Product Analyst',
				description: 'Analyse product metrics and customer feedback.',
				responsibilities: 'Build insights and dashboards.',
				sharepointUrl: 'https://sharepoint.example.com/job-specs/2',
				location: 'Dublin',
				capabilityId: 2,
				capabilityName: 'Data',
				bandId: 3,
				bandName: 'Consultant',
				closingDate: '2026-08-15',
				status: 'open',
				numberOfOpenPositions: 1,
			},
		];

		const get = vi.fn().mockResolvedValue({ data: apiRoles });
		const service = new ApiJobRoleService({ get } as never);

		await expect(service.getJobRoles(authToken)).resolves.toEqual([
			{
				jobRoleId: 1,
				roleName: 'Software Engineer',
				description: 'Build features that solve customer problems.',
				responsibilities: 'Deliver code, tests, and documentation.',
				sharepointUrl: 'not-a-url',
				location: 'Belfast',
				capabilityId: 1,
				capabilityName: 'Workday',
				bandId: 2,
				bandName: 'Senior Associate',
				closingDate: new Date('2026-08-01'),
				status: JobRoleStatus.Open,
				numberOfOpenPositions: 2,
			},
			{
				jobRoleId: 2,
				roleName: 'Product Analyst',
				description: 'Analyse product metrics and customer feedback.',
				responsibilities: 'Build insights and dashboards.',
				sharepointUrl: 'https://sharepoint.example.com/job-specs/2',
				location: 'Dublin',
				capabilityId: 2,
				capabilityName: 'Data',
				bandId: 3,
				bandName: 'Consultant',
				closingDate: new Date('2026-08-15'),
				status: JobRoleStatus.Open,
				numberOfOpenPositions: 1,
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
		const service = new ApiJobRoleService({ get } as never);

		await expect(service.getJobRole('999', authToken)).resolves.toBeNull();
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
		const service = new ApiJobRoleService({ get } as never);

		await expect(service.getJobRole('1', authToken)).resolves.toEqual({
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
		expect(get).toHaveBeenNthCalledWith(1, '/job-roles/1', {
			headers: { Authorization: `Bearer ${authToken}` },
		});
		expect(get).toHaveBeenNthCalledWith(2, '/job-roles', {
			headers: { Authorization: `Bearer ${authToken}` },
		});
	});

	it('maps invalid closing date as-is since mappers do not validate', async () => {
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
		const service = new ApiJobRoleService({ get } as never);

		const result = await service.getJobRoles(authToken);
		expect(result[0].closingDate).toEqual(new Date('not-a-date'));
	});

	it('maps insecure sharepoint URL value as-is', async () => {
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
		const service = new ApiJobRoleService({ get } as never);

		const result = await service.getJobRole('1', authToken);
		expect(result?.sharepointUrl).toBe('javascript:alert(1)');
	});

	it('maps malformed sharepoint URL value as-is for detail response', async () => {
		const apiRole = {
			jobRoleId: 1,
			roleName: 'Software Engineer',
			description: 'Build features that solve customer problems.',
			responsibilities: 'Deliver code, tests, and documentation.',
			sharepointUrl: 'not-a-url',
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
		const service = new ApiJobRoleService({ get } as never);

		const result = await service.getJobRole('1', authToken);
		expect(result?.sharepointUrl).toBe('not-a-url');
	});

	it('maps detail optional fields as-is when blank', async () => {
		const apiRole = {
			jobRoleId: 1,
			roleName: 'Software Engineer',
			description: ' ',
			responsibilities: ' ',
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
		const service = new ApiJobRoleService({ get } as never);

		await expect(service.getJobRole('1', authToken)).resolves.toEqual({
			jobRoleId: 1,
			roleName: 'Software Engineer',
			description: ' ',
			responsibilities: ' ',
			sharepointUrl: 'https://sharepoint.example.com/job-specs/1',
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
