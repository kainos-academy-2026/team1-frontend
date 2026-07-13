import {
	type NextFunction,
	type Request,
	type Response,
	Router,
} from 'express';
import { z } from 'zod';
import type { JobRoleController } from '../controllers/jobRoleController.js';
import { renderInvalidJobRoleIdError } from '../errors/errorPage.js';

const jobRoleParamsSchema = z.object({
	id: z.coerce.number().int().positive(),
});

const validateJobRoleId = (
	req: Request,
	res: Response,
	next: NextFunction,
): void => {
	const params = jobRoleParamsSchema.safeParse(req.params);
	if (!params.success) {
		renderInvalidJobRoleIdError(res);
		return;
	}

	res.locals.jobRoleId = params.data.id;
	next();
};

export const jobRoleRouter = (jobRoleController: JobRoleController): Router => {
	const router = Router();

	router.get('/', jobRoleController.getJobRoles);
	router.get('/:id', validateJobRoleId, jobRoleController.getJobRole);

	return router;
};
