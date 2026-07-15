import type { NextFunction, Request, Response } from 'express';
import {
	clearAuthSession,
	getVerifiedAuthContext,
} from '../services/authService';

export const attachAuthState = (
	req: Request,
	res: Response,
	next: NextFunction,
): void => {
	const authContext = getVerifiedAuthContext(req);
	const authRole = authContext?.authRole ?? null;

	res.locals.isAuthenticated = authContext !== null;
	res.locals.authRole = authRole;
	res.locals.isAdmin = authRole === 'admin';
	res.locals.authToken = authContext?.authSession;
	next();
};

export const redirectAuthenticatedUser = (
	req: Request,
	res: Response,
	next: NextFunction,
): void => {
	if (getVerifiedAuthContext(req)) {
		res.redirect('/job-roles');
		return;
	}

	next();
};

export const requireAuthenticatedUser = (
	req: Request,
	res: Response,
	next: NextFunction,
): void => {
	const authContext = getVerifiedAuthContext(req);
	if (!authContext) {
		clearAuthSession(res);
		res.redirect('/login');
		return;
	}

	res.locals.authToken = authContext.authSession;
	next();
};
