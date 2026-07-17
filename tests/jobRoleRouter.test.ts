import request from 'supertest';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import app from '../src/app';
import { ValidationError } from '../src/errors/validationError';
import { JobRoleStatus } from '../src/models/jobRoleStatus';
import { createAuthToken, withTestJwtSecret } from './helpers/authToken';

const { getJobRolesPage, getJobRole } = vi.hoisted(() => ({
	getJobRolesPage: vi.fn(),
	getJobRole: vi.fn(),
}));

vi.mock('../src/services/apiJobRoleService.js', () => ({
	ApiJobRoleService: class {
		getJobRoles = vi.fn();
		getJobRolesPage = getJobRolesPage;
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
		getJobRolesPage.mockResolvedValue({
			items: [
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
			],
			total: 11,
			limit: 10,
			offset: 0,
			hasNext: true,
			hasPrevious: false,
		});

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
		expect(response.text).toContain('01-08-2026');
		expect(response.text).toContain('Page 1 of 2');
		expect(response.text).toContain('offset=10');
		expect(getJobRolesPage).toHaveBeenCalledWith({
			limit: 10,
			offset: 0,
			authToken: expect.any(String),
		});
	});

	it('filters out closed job roles from the list', async () => {
		getJobRolesPage.mockResolvedValue({
			items: [
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
			],
			total: 2,
			limit: 10,
			offset: 0,
			hasNext: false,
			hasPrevious: false,
		});

		const response = await request(app)
			.get('/job-roles')
			.set('Cookie', authCookie);

		expect(response.status).toBe(200);
		expect(response.text).toContain('Open Role');
		expect(response.text).not.toContain('Closed Role');
	});

	it('returns 500 when the service throws an error', async () => {
		getJobRolesPage.mockRejectedValue(new Error('API error'));

		const response = await request(app)
			.get('/job-roles')
			.set('Cookie', authCookie);

		expect(response.status).toBe(500);
	});

	it('returns 502 when the service throws a validation error', async () => {
		getJobRolesPage.mockRejectedValue(
			new ValidationError('Missing job role ID.'),
		);

		const response = await request(app)
			.get('/job-roles')
			.set('Cookie', authCookie);

		expect(response.status).toBe(502);
	});

	it('renders an empty state when no job roles are returned', async () => {
		getJobRolesPage.mockResolvedValue({
			items: [],
			total: 0,
			limit: 10,
			offset: 0,
			hasNext: false,
			hasPrevious: false,
		});

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
	});

	it('returns 400 when the job role id is invalid', async () => {
		const response = await request(app)
			.get('/job-roles/not-a-number')
			.set('Cookie', authCookie);

		expect(response.status).toBe(400);
		expect(getJobRole).not.toHaveBeenCalled();
	});

	it('returns 404 when the job role id does not exist', async () => {
		getJobRole.mockResolvedValue(null);

		const response = await request(app)
			.get('/job-roles/999')
			.set('Cookie', authCookie);

		expect(response.status).toBe(404);
		expect(getJobRole).toHaveBeenCalledWith('999', expect.any(String));
	});
});
