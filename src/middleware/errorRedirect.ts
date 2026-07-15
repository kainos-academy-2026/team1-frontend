import type { RequestHandler } from 'express';

interface ErrorRedirectOptions {
	redirectHref: string;
	redirectText: string;
}

export const setErrorRedirect = (
	redirectHref: string,
	redirectText: string,
): RequestHandler => {
	return (_req, res, next) => {
		res.locals.errorRedirect = {
			redirectHref,
			redirectText,
		} satisfies ErrorRedirectOptions;
		next();
	};
};
