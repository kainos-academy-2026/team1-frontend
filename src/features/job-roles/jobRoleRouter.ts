import { Router } from 'express';
import type { JobRoleController } from './jobRoleController';

export const jobRoleRouter = (jobRoleController: JobRoleController): Router => {
	const router = Router();

	router.get('/', jobRoleController.getJobRoles);
	router.get('/:id', jobRoleController.getJobRole);

	return router;
};
