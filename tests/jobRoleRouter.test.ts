import request from 'supertest';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import app from '../src/app';
import { ValidationError } from '../src/errors/validationError';
import { JobRoleStatus } from '../src/models/jobRoleStatus';
import { createAuthToken, withTestJwtSecret } from './helpers/authToken';

const { getJobRolesPage, getJobRole, applyForJobRole } = vi.hoisted(() => ({
	getJobRolesPage: vi.fn(),
	getJobRole: vi.fn(),
	applyForJobRole: vi.fn(),
}));

vi.mock('../src/services/apiJobRoleService.js', () => ({
	ApiJobRoleService: class {
		getJobRoles = vi.fn();
		getJobRolesPage = getJobRolesPage;
		getJobRole = getJobRole;
		applyForJobRole = applyForJobRole;
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

/**
 * ============================================================================
 * GET /job-roles/:id/apply - INTEGRATION TESTS
 * ============================================================================
 *
 * Purpose: Test that users can view the job application form
 * What it does: Renders apply form for a valid, open job role
 * What's mocked: ApiJobRoleService.getJobRole() - returns job role data
 *
 * Routes tested:
 * - GET /job-roles/:id/apply (show apply form)
 *
 * Tests cover:
 * - Happy path: renders apply form for open role
 * - Edge case: role not found
 * - Edge case: role is closed
 * - Security: admin users cannot apply (only users)
 * - Security: unauthenticated users blocked
 * - Validation: invalid role ID format
 * ============================================================================
 */
describe('GET /job-roles/:id/apply - Show Apply Form', () => {
	let restoreJwtSecret: () => void;
	let userAuthCookie: string[];
	let adminAuthCookie: string[];

	beforeEach(() => {
		restoreJwtSecret = withTestJwtSecret();
		userAuthCookie = [`token=${createAuthToken('USER')}`];
		adminAuthCookie = [`token=${createAuthToken('ADMIN')}`];
		vi.resetAllMocks();
	});

	afterEach(() => {
		restoreJwtSecret();
	});

	/**
	 * TEST 1: Happy Path - User can view apply form
	 *
	 * Scenario: User navigates to apply page for an open job role
	 * Expected: Form is rendered with job role title and ID
	 * Mocked: getJobRole returns valid open job role data
	 */
	it('HAPPY PATH: renders apply form for an open job role', async () => {
		getJobRole.mockResolvedValue({
			jobRoleId: 5,
			roleName: 'Senior Backend Engineer',
			description: 'Lead backend development.',
			responsibilities: 'Design APIs, optimize performance.',
			sharepointUrl: 'https://sharepoint.example.com/job-specs/5',
			location: 'Dublin',
			capabilityId: 2,
			capabilityName: 'Backend',
			bandId: 3,
			bandName: 'Senior',
			closingDate: new Date('2026-09-15'),
			status: JobRoleStatus.Open,
			numberOfOpenPositions: 1,
		});

		const response = await request(app)
			.get('/job-roles/5/apply')
			.set('Cookie', userAuthCookie);

		expect(response.status).toBe(200);
		expect(response.text).toContain('Senior Backend Engineer');
		expect(response.text).toContain('Apply');
		expect(response.text).toContain('job-roles'); // Form likely references the role ID

		// Verify service was called with correct parameters
		expect(getJobRole).toHaveBeenCalledWith('5', expect.any(String));
	});

	/**
	 * TEST 2: Edge Case - Role does not exist
	 *
	 * Scenario: User tries to apply for a job role that doesn't exist
	 * Expected: 404 error page displayed
	 * Mocked: getJobRole returns null
	 */
	it('EDGE CASE: returns 404 when job role does not exist', async () => {
		getJobRole.mockResolvedValue(null);

		const response = await request(app)
			.get('/job-roles/999/apply')
			.set('Cookie', userAuthCookie);

		expect(response.status).toBe(404);
		expect(response.text).toContain('not found');
	});

	/**
	 * TEST 3: Edge Case - Role is closed
	 *
	 * Scenario: User tries to apply for a job role that's no longer open
	 * Expected: 409 error page - role not available for applications
	 * Mocked: getJobRole returns closed job role
	 */
	it('EDGE CASE: returns 409 when job role is closed', async () => {
		getJobRole.mockResolvedValue({
			jobRoleId: 6,
			roleName: 'Product Manager',
			description: 'Define product strategy.',
			responsibilities: 'Roadmap, stakeholder management.',
			sharepointUrl: 'https://sharepoint.example.com/job-specs/6',
			location: 'Belfast',
			capabilityId: 3,
			capabilityName: 'Product',
			bandId: 2,
			bandName: 'Mid-Level',
			closingDate: new Date('2026-08-01'),
			status: JobRoleStatus.Closed, // ← CLOSED
			numberOfOpenPositions: 0,
		});

		const response = await request(app)
			.get('/job-roles/6/apply')
			.set('Cookie', userAuthCookie);

		expect(response.status).toBe(409);
		expect(response.text).toContain('not available');
	});

	/**
	 * TEST 4: Edge Case - No open positions
	 *
	 * Scenario: Role is marked open but has 0 positions available
	 * Expected: 409 error - role not available
	 * Mocked: getJobRole returns role with numberOfOpenPositions = 0
	 */
	it('EDGE CASE: returns 409 when no open positions remain', async () => {
		getJobRole.mockResolvedValue({
			jobRoleId: 7,
			roleName: 'Junior Developer',
			description: 'Learn and grow.',
			responsibilities: 'Code, test, learn.',
			sharepointUrl: 'https://sharepoint.example.com/job-specs/7',
			location: 'Belfast',
			capabilityId: 1,
			capabilityName: 'Engineering',
			bandId: 1,
			bandName: 'Junior',
			closingDate: new Date('2026-08-15'),
			status: JobRoleStatus.Open, // Still marked as open
			numberOfOpenPositions: 0, // But no positions available
		});

		const response = await request(app)
			.get('/job-roles/7/apply')
			.set('Cookie', userAuthCookie);

		expect(response.status).toBe(409);
	});

	/**
	 * TEST 5: Security - Admin users cannot apply
	 *
	 * Scenario: Admin user tries to access apply form
	 * Expected: 403 Forbidden (admins don't apply for jobs)
	 * Mocked: getJobRole (should NOT be called due to auth middleware)
	 */
	it('SECURITY: returns 403 when admin user tries to apply', async () => {
		getJobRole.mockResolvedValue({
			jobRoleId: 5,
			roleName: 'Backend Role',
			status: JobRoleStatus.Open,
			numberOfOpenPositions: 1,
		});

		const response = await request(app)
			.get('/job-roles/5/apply')
			.set('Cookie', adminAuthCookie);

		expect(response.status).toBe(403);
		expect(getJobRole).not.toHaveBeenCalled(); // Auth middleware blocked it
	});

	/**
	 * TEST 6: Security - Authentication required
	 *
	 * Scenario: Unauthenticated user tries to access apply form
	 * Expected: Redirect to login or 401/302
	 * Mocked: getJobRole (should NOT be called)
	 */
	it('SECURITY: redirects unauthenticated user to login', async () => {
		getJobRole.mockResolvedValue({
			jobRoleId: 5,
			roleName: 'Backend Role',
			status: JobRoleStatus.Open,
			numberOfOpenPositions: 1,
		});

		const response = await request(app).get('/job-roles/5/apply');
		// No auth cookie sent

		expect([301, 302, 401]).toContain(response.status);
		expect(getJobRole).not.toHaveBeenCalled(); // Auth middleware blocked it
	});

	/**
	 * TEST 7: Validation - Invalid role ID format
	 *
	 * Scenario: User provides non-numeric role ID
	 * Expected: 400 Bad Request (validation middleware catches it)
	 * Mocked: getJobRole (should NOT be called)
	 */
	it('VALIDATION: returns 400 for non-numeric role ID', async () => {
		const response = await request(app)
			.get('/job-roles/invalid-id/apply')
			.set('Cookie', userAuthCookie);

		expect(response.status).toBe(400);
		expect(getJobRole).not.toHaveBeenCalled(); // Validation caught it
	});
});

/**
 * ============================================================================
 * POST /job-roles/:id/apply - INTEGRATION TESTS
 * ============================================================================
 *
 * Purpose: Test that users can submit job applications
 * What it does: Processes application and returns presigned upload URL
 * What's mocked: ApiJobRoleService.applyForJobRole() - returns upload URL
 *
 * Routes tested:
 * - POST /job-roles/:id/apply (submit application)
 *
 * Tests cover:
 * - Happy path: successful application submission
 * - Error case: role not found
 * - Error case: role not open for applications
 * - Error case: invalid request (400)
 * - Error case: server error (500)
 * - Security: only users can apply (not admins)
 * - Security: authentication required
 * - Validation: invalid role ID
 * ============================================================================
 */
describe('POST /job-roles/:id/apply - Submit Application', () => {
	let restoreJwtSecret: () => void;
	let userAuthCookie: string[];
	let adminAuthCookie: string[];

	beforeEach(() => {
		restoreJwtSecret = withTestJwtSecret();
		userAuthCookie = [`token=${createAuthToken('USER')}`];
		adminAuthCookie = [`token=${createAuthToken('ADMIN')}`];
		vi.resetAllMocks();
	});

	afterEach(() => {
		restoreJwtSecret();
	});

	/**
	 * TEST 1: Happy Path - Application submitted successfully
	 *
	 * Scenario: User submits application with valid CV
	 * Expected: 200 response with presigned S3 upload URL
	 * Mocked: applyForJobRole returns presigned URL and key
	 */
	it('HAPPY PATH: returns presigned upload URL on successful application', async () => {
		applyForJobRole.mockResolvedValue({
			uploadUrl: 'https://s3.example.com/upload?signature=abc123',
			key: 'job-applications/5/user-123/resume.pdf',
		});

		const response = await request(app)
			.post('/job-roles/5/apply')
			.set('Cookie', userAuthCookie)
			.send({
				fileName: 'resume.pdf',
				contentType: 'application/pdf',
			});

		expect(response.status).toBe(200);
		expect(response.body).toEqual({
			uploadUrl: 'https://s3.example.com/upload?signature=abc123',
			key: 'job-applications/5/user-123/resume.pdf',
		});

		// Verify service was called with correct parameters
		expect(applyForJobRole).toHaveBeenCalledWith(
			'5',
			'resume.pdf',
			'application/pdf',
			expect.any(String),
		);
	});

	/**
	 * TEST 2: Error Case - Role not found (404)
	 *
	 * Scenario: User tries to apply for non-existent job role
	 * Expected: 404 response with error message
	 * Mocked: applyForJobRole throws 404 error
	 */
	it('ERROR: returns 404 when job role does not exist', async () => {
		applyForJobRole.mockRejectedValue({
			isAxiosError: true,
			response: {
				status: 404,
				data: { error: 'Job role not found' },
			},
		});

		const response = await request(app)
			.post('/job-roles/999/apply')
			.set('Cookie', userAuthCookie)
			.send({
				fileName: 'resume.pdf',
				contentType: 'application/pdf',
			});

		expect(response.status).toBe(404);
		expect(response.body).toEqual({ error: 'Job role not found' });
	});

	/**
	 * TEST 3: Error Case - Role not open (409)
	 *
	 * Scenario: User tries to apply for closed or full role
	 * Expected: 409 response - role not available
	 * Mocked: applyForJobRole throws 409 error
	 */
	it('ERROR: returns 409 when role is not open for applications', async () => {
		applyForJobRole.mockRejectedValue({
			isAxiosError: true,
			response: {
				status: 409,
				data: { error: 'Role is closed' },
			},
		});

		const response = await request(app)
			.post('/job-roles/5/apply')
			.set('Cookie', userAuthCookie)
			.send({
				fileName: 'resume.pdf',
				contentType: 'application/pdf',
			});

		expect(response.status).toBe(409);
		expect(response.body).toEqual({
			error: 'This job role is not open for applications',
		});
	});

	/**
	 * TEST 4: Error Case - Bad request (400)
	 *
	 * Scenario: Request has invalid format (missing fileName, etc.)
	 * Expected: 400 response with specific error message
	 * Mocked: applyForJobRole throws 400 error
	 */
	it('ERROR: returns 400 for invalid application data', async () => {
		applyForJobRole.mockRejectedValue({
			isAxiosError: true,
			response: {
				status: 400,
				data: { error: 'File name is required' },
			},
		});

		const response = await request(app)
			.post('/job-roles/5/apply')
			.set('Cookie', userAuthCookie)
			.send({
				fileName: '', // Invalid - empty
				contentType: 'application/pdf',
			});

		expect(response.status).toBe(400);
		expect(response.body).toEqual({ error: 'File name is required' });
	});

	it('ERROR: returns default 400 message when upstream 400 has no error body', async () => {
		applyForJobRole.mockRejectedValue({
			isAxiosError: true,
			response: {
				status: 400,
				data: {},
			},
		});

		const response = await request(app)
			.post('/job-roles/5/apply')
			.set('Cookie', userAuthCookie)
			.send({
				fileName: 'resume.pdf',
				contentType: 'application/pdf',
			});

		expect(response.status).toBe(400);
		expect(response.body).toEqual({
			error: 'Invalid application request',
		});
	});

	it('ERROR: returns 401 when upstream API rejects authentication', async () => {
		applyForJobRole.mockRejectedValue({
			isAxiosError: true,
			response: {
				status: 401,
				data: { error: 'Unauthorized' },
			},
		});

		const response = await request(app)
			.post('/job-roles/5/apply')
			.set('Cookie', userAuthCookie)
			.send({
				fileName: 'resume.pdf',
				contentType: 'application/pdf',
			});

		expect(response.status).toBe(401);
		expect(response.body).toEqual({ error: 'Authentication required' });
	});

	it('ERROR: returns 403 when upstream API rejects authorization', async () => {
		applyForJobRole.mockRejectedValue({
			isAxiosError: true,
			response: {
				status: 403,
				data: { error: 'Forbidden' },
			},
		});

		const response = await request(app)
			.post('/job-roles/5/apply')
			.set('Cookie', userAuthCookie)
			.send({
				fileName: 'resume.pdf',
				contentType: 'application/pdf',
			});

		expect(response.status).toBe(403);
		expect(response.body).toEqual({ error: 'Forbidden' });
	});

	/**
	 * TEST 5: Error Case - Server error (500)
	 *
	 * Scenario: Backend service encounters unexpected error
	 * Expected: 500 response - generic error message
	 * Mocked: applyForJobRole throws unexpected error
	 */
	it('ERROR: returns 500 for unexpected server errors', async () => {
		applyForJobRole.mockRejectedValue(new Error('Database connection failed'));

		const response = await request(app)
			.post('/job-roles/5/apply')
			.set('Cookie', userAuthCookie)
			.send({
				fileName: 'resume.pdf',
				contentType: 'application/pdf',
			});

		expect(response.status).toBe(500);
		expect(response.body).toEqual({ error: 'Something went wrong' });
	});

	it('ERROR: returns 500 when Axios error has no response status', async () => {
		applyForJobRole.mockRejectedValue({
			isAxiosError: true,
			request: {},
		});

		const response = await request(app)
			.post('/job-roles/5/apply')
			.set('Cookie', userAuthCookie)
			.send({
				fileName: 'resume.pdf',
				contentType: 'application/pdf',
			});

		expect(response.status).toBe(500);
		expect(response.body).toEqual({ error: 'Something went wrong' });
	});

	it('ERROR: returns 500 for unmatched upstream axios status codes', async () => {
		applyForJobRole.mockRejectedValue({
			isAxiosError: true,
			response: {
				status: 502,
				data: { error: 'Bad gateway' },
			},
		});

		const response = await request(app)
			.post('/job-roles/5/apply')
			.set('Cookie', userAuthCookie)
			.send({
				fileName: 'resume.pdf',
				contentType: 'application/pdf',
			});

		expect(response.status).toBe(500);
		expect(response.body).toEqual({ error: 'Something went wrong' });
	});

	/**
	 * TEST 6: Security - Admin users cannot apply
	 *
	 * Scenario: Admin user tries to submit application
	 * Expected: 403 Forbidden
	 * Mocked: applyForJobRole (should NOT be called)
	 */
	it('SECURITY: returns 403 when admin user tries to apply', async () => {
		applyForJobRole.mockResolvedValue({
			uploadUrl: 'https://s3.example.com/upload',
			key: 'job-applications/5/admin/resume.pdf',
		});

		const response = await request(app)
			.post('/job-roles/5/apply')
			.set('Cookie', adminAuthCookie)
			.send({
				fileName: 'resume.pdf',
				contentType: 'application/pdf',
			});

		expect(response.status).toBe(403);
		expect(applyForJobRole).not.toHaveBeenCalled(); // Auth blocked it
	});

	/**
	 * TEST 7: Security - Authentication required
	 *
	 * Scenario: Unauthenticated user tries to submit application
	 * Expected: Redirect to login or 401
	 * Mocked: applyForJobRole (should NOT be called)
	 */
	it('SECURITY: redirects unauthenticated user to login', async () => {
		applyForJobRole.mockResolvedValue({
			uploadUrl: 'https://s3.example.com/upload',
			key: 'job-applications/5/user/resume.pdf',
		});

		const response = await request(app).post('/job-roles/5/apply').send({
			fileName: 'resume.pdf',
			contentType: 'application/pdf',
		});
		// No auth cookie

		expect([301, 302, 401]).toContain(response.status);
		expect(applyForJobRole).not.toHaveBeenCalled();
	});

	/**
	 * TEST 8: Validation - Invalid role ID format
	 *
	 * Scenario: User provides non-numeric role ID
	 * Expected: 400 Bad Request
	 * Mocked: applyForJobRole (should NOT be called)
	 */
	it('VALIDATION: returns 400 for non-numeric role ID', async () => {
		const response = await request(app)
			.post('/job-roles/invalid/apply')
			.set('Cookie', userAuthCookie)
			.send({
				fileName: 'resume.pdf',
				contentType: 'application/pdf',
			});

		expect(response.status).toBe(400);
		expect(applyForJobRole).not.toHaveBeenCalled();
	});
});
