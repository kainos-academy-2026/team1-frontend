import { AxiosError } from 'axios';
import { describe, expect, it, vi } from 'vitest';
import { ApplicationController } from '../src/controllers/applicationController';
import type { JobRole } from '../src/models/jobRole';
import { JobRoleStatus } from '../src/models/jobRoleStatus';
import type { JobRoleService } from '../src/services/jobRoleService';

function createMockResponse() {
	const res = {
		status: vi.fn().mockReturnThis(),
		json: vi.fn().mockReturnThis(),
		render: vi.fn().mockReturnThis(),
	};
	return res as unknown as ReturnType<typeof vi.fn> & {
		status: ReturnType<typeof vi.fn>;
		json: ReturnType<typeof vi.fn>;
		render: ReturnType<typeof vi.fn>;
	};
}

function createMockRequest(overrides: Record<string, unknown> = {}) {
	return {
		params: { id: '1' },
		cookies: { token: 'test-token' },
		body: { fileName: 'cv.pdf', contentType: 'application/pdf' },
		...overrides,
	} as never;
}

const openJobRole: JobRole = {
	jobRoleId: 1,
	roleName: 'Software Engineer',
	description: 'Build software',
	responsibilities: 'Write code',
	sharepointUrl: 'https://example.com/spec',
	location: 'Belfast',
	capabilityId: 1,
	capabilityName: 'Engineering',
	bandId: 2,
	bandName: 'Senior',
	closingDate: new Date('2026-08-01'),
	status: JobRoleStatus.Open,
	numberOfOpenPositions: 3,
};

const closedJobRole: JobRole = {
	...openJobRole,
	status: JobRoleStatus.Closed,
	numberOfOpenPositions: 0,
};

describe('ApplicationController', () => {
	describe('renderApplyPage', () => {
		it('renders the apply page for an open job role', async () => {
			const jobRoleService = {
				getJobRoles: vi.fn(),
				getJobRole: vi.fn().mockResolvedValue(openJobRole),
				applyForJobRole: vi.fn(),
			} as unknown as JobRoleService;

			const controller = new ApplicationController(jobRoleService);
			const req = createMockRequest();
			const res = createMockResponse();

			await controller.renderApplyPage(req, res as never);

			expect(res.render).toHaveBeenCalledWith('apply.njk', {
				title: 'Apply - Software Engineer',
				jobRole: { jobRoleId: 1, roleName: 'Software Engineer' },
			});
		});

		it('returns 404 when job role does not exist', async () => {
			const jobRoleService = {
				getJobRoles: vi.fn(),
				getJobRole: vi.fn().mockResolvedValue(null),
				applyForJobRole: vi.fn(),
			} as unknown as JobRoleService;

			const controller = new ApplicationController(jobRoleService);
			const req = createMockRequest();
			const res = createMockResponse();

			await controller.renderApplyPage(req, res as never);

			expect(res.status).toHaveBeenCalledWith(404);
			expect(res.render).toHaveBeenCalledWith(
				'error-page.njk',
				expect.objectContaining({ heading: 'Job role not found' }),
			);
		});

		it('returns 409 when job role is closed', async () => {
			const jobRoleService = {
				getJobRoles: vi.fn(),
				getJobRole: vi.fn().mockResolvedValue(closedJobRole),
				applyForJobRole: vi.fn(),
			} as unknown as JobRoleService;

			const controller = new ApplicationController(jobRoleService);
			const req = createMockRequest();
			const res = createMockResponse();

			await controller.renderApplyPage(req, res as never);

			expect(res.status).toHaveBeenCalledWith(409);
			expect(res.render).toHaveBeenCalledWith(
				'error-page.njk',
				expect.objectContaining({ heading: 'Role not available' }),
			);
		});

		it('returns 409 when open positions is 0', async () => {
			const noPositionsRole = {
				...openJobRole,
				numberOfOpenPositions: 0,
			};
			const jobRoleService = {
				getJobRoles: vi.fn(),
				getJobRole: vi.fn().mockResolvedValue(noPositionsRole),
				applyForJobRole: vi.fn(),
			} as unknown as JobRoleService;

			const controller = new ApplicationController(jobRoleService);
			const req = createMockRequest();
			const res = createMockResponse();

			await controller.renderApplyPage(req, res as never);

			expect(res.status).toHaveBeenCalledWith(409);
		});
	});

	describe('handleApply', () => {
		it('returns 200 with presigned upload data on success', async () => {
			const applyResult = {
				uploadUrl: 'https://s3.example.com/upload',
				key: 'job-applications/1/7/123-cv.pdf',
			};
			const jobRoleService = {
				getJobRoles: vi.fn(),
				getJobRole: vi.fn(),
				applyForJobRole: vi.fn().mockResolvedValue(applyResult),
			} as unknown as JobRoleService;

			const controller = new ApplicationController(jobRoleService);
			const req = createMockRequest();
			const res = createMockResponse();

			await controller.handleApply(req, res as never);

			expect(jobRoleService.applyForJobRole).toHaveBeenCalledWith(
				'1',
				'cv.pdf',
				'application/pdf',
				'test-token',
			);
			expect(res.status).toHaveBeenCalledWith(200);
			expect(res.json).toHaveBeenCalledWith(applyResult);
		});

		it('returns 404 when backend returns 404', async () => {
			const error = new AxiosError('Not Found', '404', undefined, undefined, {
				status: 404,
				data: { error: 'Job role not found' },
				statusText: 'Not Found',
				headers: {},
				config: {} as never,
			});
			const jobRoleService = {
				getJobRoles: vi.fn(),
				getJobRole: vi.fn(),
				applyForJobRole: vi.fn().mockRejectedValue(error),
			} as unknown as JobRoleService;

			const controller = new ApplicationController(jobRoleService);
			const req = createMockRequest();
			const res = createMockResponse();

			await controller.handleApply(req, res as never);

			expect(res.status).toHaveBeenCalledWith(404);
			expect(res.json).toHaveBeenCalledWith({ error: 'Job role not found' });
		});

		it('returns 409 when backend returns 409', async () => {
			const error = new AxiosError('Conflict', '409', undefined, undefined, {
				status: 409,
				data: { error: 'Job role is not open for applications' },
				statusText: 'Conflict',
				headers: {},
				config: {} as never,
			});
			const jobRoleService = {
				getJobRoles: vi.fn(),
				getJobRole: vi.fn(),
				applyForJobRole: vi.fn().mockRejectedValue(error),
			} as unknown as JobRoleService;

			const controller = new ApplicationController(jobRoleService);
			const req = createMockRequest();
			const res = createMockResponse();

			await controller.handleApply(req, res as never);

			expect(res.status).toHaveBeenCalledWith(409);
			expect(res.json).toHaveBeenCalledWith({
				error: 'This job role is not open for applications',
			});
		});

		it('returns 400 when backend returns 400', async () => {
			const error = new AxiosError('Bad Request', '400', undefined, undefined, {
				status: 400,
				data: { error: 'File name is required' },
				statusText: 'Bad Request',
				headers: {},
				config: {} as never,
			});
			const jobRoleService = {
				getJobRoles: vi.fn(),
				getJobRole: vi.fn(),
				applyForJobRole: vi.fn().mockRejectedValue(error),
			} as unknown as JobRoleService;

			const controller = new ApplicationController(jobRoleService);
			const req = createMockRequest();
			const res = createMockResponse();

			await controller.handleApply(req, res as never);

			expect(res.status).toHaveBeenCalledWith(400);
			expect(res.json).toHaveBeenCalledWith({
				error: 'File name is required',
			});
		});

		it('returns 500 for unexpected errors', async () => {
			const jobRoleService = {
				getJobRoles: vi.fn(),
				getJobRole: vi.fn(),
				applyForJobRole: vi.fn().mockRejectedValue(new Error('unexpected')),
			} as unknown as JobRoleService;

			const controller = new ApplicationController(jobRoleService);
			const req = createMockRequest();
			const res = createMockResponse();

			await controller.handleApply(req, res as never);

			expect(res.status).toHaveBeenCalledWith(500);
			expect(res.json).toHaveBeenCalledWith({
				error: 'Something went wrong',
			});
		});
	});
});
