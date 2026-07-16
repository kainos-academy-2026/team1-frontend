import axios from 'axios';
import type { NextFunction, Request, Response } from 'express';
import { errorMessages } from './errorMessages.js';
import { renderErrorPage } from './errorPage.js';
import { ValidationError } from './validationError.js';

interface ErrorRedirectOptions {
	redirectHref: string;
	redirectText: string;
}

const defaultRedirectOptions: ErrorRedirectOptions = {
	redirectHref: '/job-roles',
	redirectText: 'Back to open roles',
};

const toNonEmptyString = (value: unknown): string | null => {
	if (typeof value !== 'string') {
		return null;
	}

	const trimmedValue = value.trim();
	if (trimmedValue.length === 0) {
		return null;
	}

	return trimmedValue;
};

const getErrorRedirect = (res: Response): ErrorRedirectOptions => {
	const errorRedirect = res.locals.errorRedirect as
		| Partial<ErrorRedirectOptions>
		| undefined;

	if (!errorRedirect) {
		return defaultRedirectOptions;
	}

	const redirectHref = toNonEmptyString(errorRedirect.redirectHref);
	const redirectText = toNonEmptyString(errorRedirect.redirectText);

	if (!redirectHref || !redirectText) {
		return defaultRedirectOptions;
	}

	return {
		redirectHref,
		redirectText,
	};
};

export const errorHandler = (
	error: Error,
	_req: Request,
	res: Response,
	_next: NextFunction,
): void => {
	console.error(error);
	const redirectOptions = getErrorRedirect(res);

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
