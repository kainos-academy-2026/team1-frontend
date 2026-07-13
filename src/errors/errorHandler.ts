import axios from 'axios';
import type { NextFunction, Request, Response } from 'express';
import { errorMessages } from './errorMessages.js';
import { renderErrorPage } from './errorPage.js';
import { ValidationError } from './validationError.js';

const getErrorRedirect = (
	req: Request,
): { redirectHref: string; redirectText: string } => {
	if (req.path === '/job-roles') {
		return {
			redirectHref: '/',
			redirectText: 'Back to home',
		};
	}

	return {
		redirectHref: '/job-roles',
		redirectText: 'Back to open roles',
	};
};

export const errorHandler = (
	error: Error,
	req: Request,
	res: Response,
	_next: NextFunction,
): void => {
	const redirectOptions = getErrorRedirect(req);

	if (error instanceof ValidationError) {
		const { title, message } = errorMessages.upstreamDataError;
		renderErrorPage(res, {
			status: 502,
			title,
			message,
			...redirectOptions,
		});
		return;
	}

	if (axios.isAxiosError(error)) {
		const { title, message } = errorMessages.upstreamApiError;
		renderErrorPage(res, {
			status: 502,
			title,
			message,
			...redirectOptions,
		});
		return;
	}

	const { title, message } = errorMessages.internalServerError;
	renderErrorPage(res, {
		status: 500,
		title,
		message,
		...redirectOptions,
	});
};
