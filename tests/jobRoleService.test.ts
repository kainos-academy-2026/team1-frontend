import { describe, expect, it, vi } from 'vitest';
import { ValidationError } from '../src/errors/validationError';
import type { JobRole } from '../src/models/jobRole';
import { JobRoleStatus } from '../src/models/jobRoleStatus';
import { ApiJobRoleService } from '../src/services/apiJobRoleService';

describe('ApiJobRoleService', () => {
	const authToken = 'test-auth-token';

	it('allows construction when an API base URL is injected', () => {
		const get = vi.fn();

		expect(() => new ApiJobRoleService({ get } as never)).not.toThrow();
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
		const service = new ApiJobRoleService({ get } as never);

		await expect(service.getJobRoles(authToken)).resolves.toEqual(
			expectedRoles,
		);
		expect(get).toHaveBeenCalledWith('/job-roles', {
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
				capabilityName: 'Capability 3',
				bandId: 3,
				bandName: 'Band 3',
				closingDate: new Date('2024-10-31T00:00:00.000Z'),
				status: JobRoleStatus.Closed,
				numberOfOpenPositions: 1,
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
		const service = new ApiJobRoleService({ get } as never);

		await expect(service.getJobRoles(authToken)).rejects.toBeInstanceOf(
			ValidationError,
		);
		await expect(service.getJobRoles(authToken)).rejects.toThrow(
			'Unexpected job role status: draft',
		);
	});

	it('throws ValidationError when status is not a string', async () => {
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

		await expect(service.getJobRoles(authToken)).rejects.toBeInstanceOf(
			ValidationError,
		);
		await expect(service.getJobRoles(authToken)).rejects.toThrow(
			'Unexpected job role status: null',
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
		const service = new ApiJobRoleService({ get } as never);

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
		const service = new ApiJobRoleService({ get } as never);

		await expect(service.getJobRoles(authToken)).rejects.toBeInstanceOf(
			ValidationError,
		);
		await expect(service.getJobRoles(authToken)).rejects.toThrow(
			'Missing required job role field: capabilityId',
		);
	});

	it('throws ValidationError when roleName is not a string', async () => {
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

		await expect(service.getJobRoles(authToken)).rejects.toBeInstanceOf(
			ValidationError,
		);
		await expect(service.getJobRoles(authToken)).rejects.toThrow(
			'Missing required job role field: roleName',
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
		const service = new ApiJobRoleService({ get } as never);

		await expect(service.getJobRole(1, authToken)).resolves.toEqual({
			...apiRole,
			closingDate: new Date('2026-08-01'),
			status: JobRoleStatus.Open,
		});
		expect(get).toHaveBeenCalledWith('/job-roles/1', {
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
				description: 'Description not available.',
				responsibilities: 'Responsibilities not available.',
				sharepointUrl: 'https://sharepoint.example.com/job-specs/1',
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

	it('keeps summary rows when sharepoint URL is invalid', async () => {
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
				sharepointUrl: '',
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
		const service = new ApiJobRoleService({ get } as never);

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
		expect(get).toHaveBeenNthCalledWith(1, '/job-roles/1', {
			headers: { Authorization: `Bearer ${authToken}` },
		});
		expect(get).toHaveBeenNthCalledWith(2, '/job-roles', {
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
		const service = new ApiJobRoleService({ get } as never);

		await expect(service.getJobRoles(authToken)).rejects.toBeInstanceOf(
			ValidationError,
		);
		await expect(service.getJobRoles(authToken)).rejects.toThrow(
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
		const service = new ApiJobRoleService({ get } as never);

		await expect(service.getJobRole(1, authToken)).rejects.toBeInstanceOf(
			ValidationError,
		);
		await expect(service.getJobRole(1, authToken)).rejects.toThrow(
			'sharepointUrl must use HTTPS: javascript:alert(1)',
		);
	});

	it('throws when detail API returns a malformed sharepoint URL', async () => {
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

		await expect(service.getJobRole(1, authToken)).rejects.toBeInstanceOf(
			ValidationError,
		);
		await expect(service.getJobRole(1, authToken)).rejects.toThrow(
			'Invalid sharepointUrl format: not-a-url',
		);
	});

	it('uses fallback values when detail optional fields are blank', async () => {
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

		await expect(service.getJobRole(1, authToken)).resolves.toEqual({
			jobRoleId: 1,
			roleName: 'Software Engineer',
			description: 'Description not available.',
			responsibilities: 'Responsibilities not available.',
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
