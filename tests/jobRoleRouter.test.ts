import request from 'supertest';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import app from '../src/app';
import { ValidationError } from '../src/errors/validationError';
import { JobRoleStatus } from '../src/models/jobRoleStatus';
import { createAuthToken, withTestJwtSecret } from './helpers/authToken';

const { getJobRoles, getJobRole } = vi.hoisted(() => ({
	getJobRoles: vi.fn(),
	getJobRole: vi.fn(),
}));

vi.mock('../src/services/apiJobRoleService.js', () => ({
	ApiJobRoleService: class {
		getJobRoles = getJobRoles;
		getJobRole = getJobRole;
	},
}));

describe('GET /job-roles', () => {
	let restoreJwtSecret: () => void;
	let authCookie: string[];

	beforeEach(() => {
		restoreJwtSecret = withTestJwtSecret();
		authCookie = [`token=${createAuthToken()}`];
		vi.resetAllMocks();
	});

	afterEach(() => {
		restoreJwtSecret();
	});

	it('renders a list of open job roles', async () => {
		getJobRoles.mockResolvedValue([
			{
				jobRoleId: 1,
				roleName: 'Software Engineer',
				description: 'Build features that solve customer problems.',
				responsibilities: 'Deliver code, tests, and documentation.',
				sharepointUrl: 'https://sharepoint.example.com/job-specs/1',
				location: 'Belfast',
				capabilityId: 1,
				capabilityName: 'Workday',
				bandId: 1,
				bandName: 'Associate',
				closingDate: new Date('2026-08-01'),
				status: JobRoleStatus.Open,
				numberOfOpenPositions: 2,
			},
		]);

		const response = await request(app)
			.get('/job-roles')
			.set('Cookie', authCookie);

		expect(response.status).toBe(200);
		expect(response.text).toContain('Software Engineer');
		expect(response.text).toContain('Belfast');
		expect(response.text).toContain('Workday');
		expect(response.text).toContain('Associate');
		expect(response.text).toContain('class="job-card-link"');
		expect(response.text).toContain('href="/job-roles/1"');
	});

	it('filters out closed job roles from the list', async () => {
		getJobRoles.mockResolvedValue([
			{
				jobRoleId: 1,
				roleName: 'Open Role',
				description: 'Open role description.',
				responsibilities: 'Open role responsibilities.',
				sharepointUrl: 'https://sharepoint.example.com/job-specs/1',
				location: 'Belfast',
				capabilityId: 1,
				capabilityName: 'Workday',
				bandId: 1,
				bandName: 'Associate',
				closingDate: new Date('2026-08-01'),
				status: JobRoleStatus.Open,
				numberOfOpenPositions: 2,
			},
			{
				jobRoleId: 2,
				roleName: 'Closed Role',
				description: 'Closed role description.',
				responsibilities: 'Closed role responsibilities.',
				sharepointUrl: 'https://sharepoint.example.com/job-specs/2',
				location: 'Belfast',
				capabilityId: 1,
				capabilityName: 'Workday',
				bandId: 1,
				bandName: 'Associate',
				closingDate: new Date('2026-08-01'),
				status: JobRoleStatus.Closed,
				numberOfOpenPositions: 0,
			},
		]);

		const response = await request(app)
			.get('/job-roles')
			.set('Cookie', authCookie);

		expect(response.status).toBe(200);
		expect(response.text).toContain('Open Role');
		expect(response.text).not.toContain('Closed Role');
	});

	it('returns 500 when the service throws an error', async () => {
		getJobRoles.mockRejectedValue(new Error('API error'));

		const response = await request(app)
			.get('/job-roles')
			.set('Cookie', authCookie);

		expect(response.status).toBe(500);
		expect(response.text).toContain('Back to open roles');
		expect(response.text).toContain('href="/job-roles"');
	});

	it('returns 502 when the service throws a validation error', async () => {
		getJobRoles.mockRejectedValue(new ValidationError('Missing job role ID.'));

		const response = await request(app)
			.get('/job-roles')
			.set('Cookie', authCookie);

		expect(response.status).toBe(502);
		expect(response.text).toContain(
			'The job data received from the upstream API was invalid.',
		);
		expect(response.text).toContain('Back to open roles');
		expect(response.text).toContain('href="/job-roles"');
	});

	it('renders an empty state when no job roles are returned', async () => {
		getJobRoles.mockResolvedValue([]);

		const response = await request(app)
			.get('/job-roles')
			.set('Cookie', authCookie);

		expect(response.status).toBe(200);
		expect(response.text).toContain('No job roles are currently available.');
	});

	it('renders all fields of a job role detail page', async () => {
		getJobRole.mockResolvedValue({
			jobRoleId: 1,
			roleName: 'Software Engineer',
			description: 'Build features that solve customer problems.',
			responsibilities: 'Deliver code, tests, and documentation.',
			sharepointUrl: 'https://sharepoint.example.com/job-specs/1',
			location: 'Belfast',
			capabilityId: 1,
			capabilityName: 'Workday',
			bandId: 1,
			bandName: 'Associate',
			closingDate: new Date('2026-08-01T00:00:00.000Z'),
			status: JobRoleStatus.Open,
			numberOfOpenPositions: 2,
		});

		const response = await request(app)
			.get('/job-roles/1')
			.set('Cookie', authCookie);

		expect(response.status).toBe(200);
		expect(response.text).toContain('Software Engineer');
		expect(response.text).toContain('Workday');
		expect(response.text).toContain('Associate');
		expect(response.text).toContain(
			'Build features that solve customer problems.',
		);
		expect(response.text).toContain('Deliver code, tests, and documentation.');
		expect(response.text).toContain('View Job Specification');
		expect(response.text).toContain(
			'https://sharepoint.example.com/job-specs/1',
		);
		expect(response.text).toContain('2');
	});

	it('returns 400 when the job role id is invalid', async () => {
		const response = await request(app)
			.get('/job-roles/not-a-number')
			.set('Cookie', authCookie);

		expect(response.status).toBe(400);
		expect(response.text).toContain('Bad request');
		expect(response.text).toContain('Invalid job role ID provided.');
		expect(response.text).toContain('href="/job-roles"');
		expect(getJobRole).not.toHaveBeenCalled();
	});

	it('returns 404 when the job role id does not exist', async () => {
		getJobRole.mockResolvedValue(null);

		const response = await request(app)
			.get('/job-roles/999')
			.set('Cookie', authCookie);

		expect(response.status).toBe(404);
		expect(response.text).toContain(
			'The job role you requested could not be found.',
		);
		expect(response.text).toContain('Back to open roles');
		expect(response.text).toContain('href="/job-roles"');
		expect(getJobRole).toHaveBeenCalledWith('999', expect.any(String));
	});
});
