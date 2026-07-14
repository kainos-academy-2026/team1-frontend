import type { Request, Response } from 'express';
import { renderJobRoleNotFoundError } from '../errors/errorPage';
import {
	mapJobRoleDetailViewModel,
	mapJobRoleListItemViewModel,
} from '../mappers/jobRoleViewMapper';
import { JobRoleStatus } from '../models/jobRoleStatus';
import type { JobRoleService } from '../services/jobRoleService';

export class JobRoleController {
	constructor(private readonly jobRoleService: JobRoleService) {}

	getJobRoles = async (_req: Request, res: Response): Promise<void> => {
		const authToken = res.locals.authToken as string | undefined;
		const isAdmin = res.locals.isAdmin as boolean;
		const jobRoles = (await this.jobRoleService.getJobRoles(authToken))
			.filter((jobRole) => isAdmin || jobRole.status === JobRoleStatus.Open)
			.map(mapJobRoleListItemViewModel);
		res.render('job-role-list.njk', { jobRoles });
	};

	getJobRole = async (_req: Request, res: Response): Promise<void> => {
		const jobRoleId = res.locals.jobRoleId as number;
		const authToken = res.locals.authToken as string;
		const jobRole = await this.jobRoleService.getJobRole(jobRoleId, authToken);
		if (!jobRole) {
			renderJobRoleNotFoundError(res);
			return;
		}

		res.render('job-role-information.njk', {
			jobRole: mapJobRoleDetailViewModel(jobRole),
		});
	};
}
