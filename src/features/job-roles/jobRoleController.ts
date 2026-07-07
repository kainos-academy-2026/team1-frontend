import type { Request, Response } from 'express';
import type { JobRoleService } from './jobRoleService';

export class JobRoleController {
	constructor(private readonly jobRoleService: JobRoleService) {}

	getJobRoles = async (_req: Request, res: Response): Promise<void> => {
		const jobRoles = await this.jobRoleService.getJobRoles();
		res.render('job-role-list.njk', { jobRoles });
	};
}
