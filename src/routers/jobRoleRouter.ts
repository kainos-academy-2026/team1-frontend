import {
	type NextFunction,
	type Request,
	type Response,
	Router,
} from 'express';
import { z } from 'zod';
import type { JobRoleController } from '../controllers/jobRoleController';

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
		res.status(400).send('Invalid job role id');
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
