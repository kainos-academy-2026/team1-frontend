import type { Request, Response } from 'express';
import { renderJobRoleNotFoundError } from '../errors/errorPage.js';
import type { JobRoleViewMapper } from '../mappers/jobRoleViewMapper.js';
import { JobRoleStatus } from '../models/jobRoleStatus.js';
import type { JobRoleService } from '../services/jobRoleService.js';
import { formatClosingDate } from '../utils/formatClosingDate.js';

export class JobRoleController {
	constructor(
		private readonly jobRoleService: JobRoleService,
		private readonly jobRoleViewMapper: JobRoleViewMapper,
	) {}

	getJobRoles = async (req: Request, res: Response): Promise<void> => {
		const authToken = req.cookies.token;

		const jobRoles = (await this.jobRoleService.getJobRoles(authToken))
			.filter((jobRole) => jobRole.status === JobRoleStatus.Open)
			.map((jobRole) =>
				this.jobRoleViewMapper.mapJobRoleListItemViewModel(
					jobRole,
					formatClosingDate(jobRole.closingDate),
				),
			);

		res.render('job-role-list.njk', { jobRoles });
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
			jobRole: this.jobRoleViewMapper.mapJobRoleDetailViewModel(
				jobRole,
				formatClosingDate(jobRole.closingDate),
			),
		});
	};
}
