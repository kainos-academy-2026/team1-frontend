import type { Response } from 'express';
import { errorMessages } from './errorMessages.js';

interface ErrorPageOptions {
	status: number;
	title: string;
	message: string;
	redirectHref?: string;
	redirectText?: string;
}

const toRedirectHref = (redirectHref?: string): string => {
	if (typeof redirectHref !== 'string') {
		return '/job-roles';
	}

	const trimmedHref = redirectHref.trim();
	if (trimmedHref.length === 0) {
		return '/job-roles';
	}

	if (trimmedHref.startsWith('/')) {
		return trimmedHref;
	}

	return `/${trimmedHref}`;
};

export const renderErrorPage = (
	res: Response,
	{
		status,
		title,
		message,
		redirectHref,
		redirectText = 'Back to open roles',
	}: ErrorPageOptions,
): void => {
	res.status(status).render('errors/error-page.njk', {
		title,
		message,
		redirectHref: toRedirectHref(redirectHref),
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
