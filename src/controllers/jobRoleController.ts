import type { Request, Response } from 'express';
import {
	mapJobRoleDetailViewModel,
	mapJobRoleListItemViewModel,
} from '../mappers/jobRoleViewMapper';
import { JobRoleStatus } from '../models/jobRoleStatus';
import type { JobRoleService } from '../services/jobRoleService';

export class JobRoleController {
	constructor(private readonly jobRoleService: JobRoleService) {}

	getJobRoles = async (_req: Request, res: Response): Promise<void> => {
		const jobRoles = (await this.jobRoleService.getJobRoles())
			.filter((jobRole) => jobRole.status === JobRoleStatus.Open)
			.map(mapJobRoleListItemViewModel);
		res.render('job-role-list.njk', { jobRoles });
	};

	getJobRole = async (_req: Request, res: Response): Promise<void> => {
		const jobRoleId = res.locals.jobRoleId as number;
		const jobRole = await this.jobRoleService.getJobRole(jobRoleId);
		if (!jobRole) {
			res.status(404).send('Job role not found');
			return;
		}

		res.render('job-role-information.njk', {
			jobRole: mapJobRoleDetailViewModel(jobRole),
		});
	};
}
