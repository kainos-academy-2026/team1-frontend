import type { Request, Response } from 'express';
import { renderJobRoleNotFoundError } from '../errors/errorPage.js';
import {
	mapJobRoleDetailViewModel,
	mapJobRoleListItemViewModel,
} from '../mappers/jobRoleViewMapper.js';
import { JobRoleStatus } from '../models/jobRoleStatus.js';
import type { JobRoleService } from '../services/jobRoleService.js';

export class JobRoleController {
	constructor(private readonly jobRoleService: JobRoleService) {}

	getJobRoles = async (_req: Request, res: Response): Promise<void> => {
		const jobRoles = (await this.jobRoleService.getJobRoles())
			.filter((jobRole) => jobRole.status === JobRoleStatus.Open)
			.map(mapJobRoleListItemViewModel);
		res.render('job-role-list.njk', { jobRoles });
	};

	getJobRole = async (
		req: Request<{ id: string }>,
		res: Response,
	): Promise<void> => {
		const jobRoleId = Number(req.params.id);
		const jobRole = await this.jobRoleService.getJobRole(jobRoleId);
		if (!jobRole) {
			renderJobRoleNotFoundError(res);
			return;
		}

		res.render('job-role-information.njk', {
			jobRole: mapJobRoleDetailViewModel(jobRole),
		});
	};
}
