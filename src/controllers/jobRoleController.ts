import type { Request, Response } from 'express';
import { renderJobRoleNotFoundError } from '../errors/errorPage.js';
import type { JobRoleViewMapper } from '../mappers/jobRoleViewMapper.js';
import { JobRoleStatus } from '../models/jobRoleStatus.js';
import type { JobRoleService } from '../services/jobRoleService.js';
import { formatClosingDate } from '../utils/formatClosingDate.js';

const toQueryNumber = (value: unknown, fallback: number): number => {
	if (typeof value === 'number' && Number.isFinite(value)) {
		return value;
	}

	if (typeof value === 'string') {
		const parsed = Number(value);
		if (Number.isFinite(parsed)) {
			return parsed;
		}
	}

	return fallback;
};

export class JobRoleController {
	constructor(
		private readonly jobRoleService: JobRoleService,
		private readonly jobRoleViewMapper: JobRoleViewMapper,
	) {}

	getJobRoles = async (req: Request, res: Response): Promise<void> => {
		const authToken = req.cookies.token as string;
		const pageSize = Math.max(
			1,
			Math.trunc(toQueryNumber(req.query.limit, 10)),
		);
		const offset = Math.max(0, Math.trunc(toQueryNumber(req.query.offset, 0)));
		const page = await this.jobRoleService.getJobRolesPage({
			limit: pageSize,
			offset,
			authToken,
		});
		const jobRoles = page.items
			.filter((jobRole) => jobRole.status === JobRoleStatus.Open)
			.map((jobRole) =>
				this.jobRoleViewMapper.mapJobRoleListItemViewModel({
					jobRole,
					closingDate: formatClosingDate(jobRole.closingDate),
				}),
			);
		const jobRoleListViewModel = {
			jobRoles,
			pageSize,
			offset,
			total: page.total,
			currentPage: Math.floor(offset / pageSize) + 1,
			totalPages: Math.max(1, Math.ceil(page.total / pageSize)),
			hasNext: page.hasNext,
			hasPrevious: page.hasPrevious,
			firstOffset: 0,
			previousOffset: Math.max(0, offset - pageSize),
			nextOffset: offset + pageSize,
			lastOffset:
				page.total > 0 ? Math.floor((page.total - 1) / pageSize) * pageSize : 0,
		};

		res.render('job-role-list.njk', jobRoleListViewModel);
	};

	getJobRole = async (req: Request, res: Response): Promise<void> => {
		const token = req.cookies.token as string;
		const jobRoleId = req.params.id as string;

		const jobRole = await this.jobRoleService.getJobRole(jobRoleId, token);
		if (!jobRole) {
			renderJobRoleNotFoundError(res);
			return;
		}

		res.render('job-role-information.njk', {
			jobRole: this.jobRoleViewMapper.mapJobRoleDetailViewModel({
				jobRole,
				closingDate: formatClosingDate(jobRole.closingDate),
			}),
		});
	};
}
