import type { NextFunction, Request, Response } from 'express';
import { renderInvalidJobRoleIdError } from '../errors/errorPage.js';
import { jobRoleParamsSchema } from '../models/jobRoleParamsDto.js';

export const validateJobRoleId = (
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
