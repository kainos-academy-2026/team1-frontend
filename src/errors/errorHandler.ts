import axios from 'axios';
import type { NextFunction, Request, Response } from 'express';
import { errorMessages } from './errorMessages';
import { renderErrorPage } from './errorPage';
import { ValidationError } from './validationError';

export const errorHandler = (
	error: Error,
	_req: Request,
	res: Response,
	_next: NextFunction,
): void => {
	if (error instanceof ValidationError) {
		const { title, message } = errorMessages.upstreamDataError;
		renderErrorPage(res, {
			status: 502,
			title,
			message,
		});
		return;
	}

	if (axios.isAxiosError(error)) {
		const { title, message } = errorMessages.upstreamApiError;
		renderErrorPage(res, {
			status: 502,
			title,
			message,
		});
		return;
	}

	const { title, message } = errorMessages.internalServerError;
	renderErrorPage(res, {
		status: 500,
		title,
		message,
	});
};
