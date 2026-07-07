import type { Request, Response } from 'express';
import { getJobRoles } from './jobRoleService';

export const getJobRolesController = async (req: Request, res: Response): Promise<void> => {
	const jobRoles = await getJobRoles();
	res.render('job-role-list.njk', { jobRoles });
};
