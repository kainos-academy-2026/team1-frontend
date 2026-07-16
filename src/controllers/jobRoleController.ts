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

	getJobRoles = async (req: Request, res: Response): Promise<void> => {
		const authToken = req.cookies.token;

		const jobRoles = (await this.jobRoleService.getJobRoles(authToken))
			.filter((jobRole) => jobRole.status === JobRoleStatus.Open)
			.map(mapJobRoleListItemViewModel);

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
			jobRole: mapJobRoleDetailViewModel(jobRole),
		});
	};
}
