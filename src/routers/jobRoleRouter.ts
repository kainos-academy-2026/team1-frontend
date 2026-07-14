import { Router } from 'express';
import type { JobRoleController } from '../controllers/jobRoleController.js';
import { validateParams } from '../middleware/validate.js';
import { jobRoleParamsSchema } from '../models/jobRoleParamsDto.js';

export const jobRoleRouter = (jobRoleController: JobRoleController): Router => {
	const router = Router();

	router.get('/', jobRoleController.getJobRoles);
	router.get(
		'/:id',
		validateParams(jobRoleParamsSchema),
		jobRoleController.getJobRole,
	);

	return router;
};
