import { Router } from 'express';
import type { JobRoleController } from '../controllers/jobRoleController.js';
import { requireAuthenticatedUser } from '../middleware/auth.js';
import { validateJobRoleId } from '../middleware/validateJobRoleId.js';

export const jobRoleRouter = (jobRoleController: JobRoleController): Router => {
	const router = Router();
	router.use(requireAuthenticatedUser);

	router.get('/', jobRoleController.getJobRoles);
	router.get('/:id', validateJobRoleId, jobRoleController.getJobRole);

	return router;
};
