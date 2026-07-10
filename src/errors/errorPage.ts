import type { Response } from 'express';
import { errorMessages } from './errorMessages';

interface ErrorPageOptions {
	status: number;
	title: string;
	message: string;
	redirectHref?: string;
	redirectText?: string;
}

export const renderErrorPage = (
	res: Response,
	{
		status,
		title,
		message,
		redirectHref = '/job-roles',
		redirectText = 'Back to open roles',
	}: ErrorPageOptions,
): void => {
	res.status(status).render('errors/error-page.njk', {
		title,
		message,
		redirectHref,
		redirectText,
	});
};

export const renderInvalidJobRoleIdError = (res: Response): void => {
	const { title, message } = errorMessages.invalidJobRoleId;
	renderErrorPage(res, {
		status: 400,
		title,
		message,
	});
};

export const renderJobRoleNotFoundError = (res: Response): void => {
	const { title, message } = errorMessages.jobRoleNotFound;
	renderErrorPage(res, {
		status: 404,
		title,
		message,
	});
};
