import type { NextFunction, Request, Response } from 'express';

const AUTH_SESSION_COOKIE = 'authSession';

const parseCookies = (
	cookieHeader: string | undefined,
): Record<string, string> => {
	if (!cookieHeader) {
		return {};
	}

	return cookieHeader.split(';').reduce<Record<string, string>>((acc, pair) => {
		const [name, ...rest] = pair.split('=');
		if (!name || rest.length === 0) {
			return acc;
		}

		const key = name.trim();
		const value = rest.join('=').trim();
		if (!key || !value) {
			return acc;
		}

		try {
			acc[key] = decodeURIComponent(value);
		} catch {
			acc[key] = value;
		}

		return acc;
	}, {});
};

const decodePayload = (token: string): Record<string, unknown> | null => {
	const parts = token.split('.');
	if (parts.length !== 3) {
		return null;
	}

	try {
		const payload = JSON.parse(
			Buffer.from(parts[1], 'base64url').toString('utf8'),
		) as unknown;

		if (!payload || typeof payload !== 'object') {
			return null;
		}

		return payload as Record<string, unknown>;
	} catch {
		return null;
	}
};

const toStringArray = (value: unknown): string[] => {
	if (typeof value === 'string') {
		return [value];
	}

	if (Array.isArray(value)) {
		return value.filter((item): item is string => typeof item === 'string');
	}

	return [];
};

export const getAuthSession = (req: Request): string | null => {
	const token = parseCookies(req.headers.cookie)[AUTH_SESSION_COOKIE];
	if (!token || token.trim().length === 0) {
		return null;
	}

	return token;
};

export const getAuthRole = (req: Request): 'admin' | 'applicant' | null => {
	const token = getAuthSession(req);
	if (!token) {
		return null;
	}

	const payload = decodePayload(token);
	if (!payload) {
		return null;
	}

	const claims = [
		...toStringArray(payload.role),
		...toStringArray(payload.roles),
		...toStringArray(payload.userType),
		...toStringArray(payload.permissions),
		...toStringArray(payload.scopes),
	].map((value) => value.trim().toLowerCase());

	if (claims.some((value) => value.includes('admin'))) {
		return 'admin';
	}

	if (claims.some((value) => value.includes('applicant') || value.includes('user'))) {
		return 'applicant';
	}

	return null;
};

export const attachAuthState = (
	req: Request,
	res: Response,
	next: NextFunction,
): void => {
	const authSession = getAuthSession(req);
	const authRole = getAuthRole(req);

	res.locals.isAuthenticated = Boolean(authSession);
	res.locals.authRole = authRole;
	res.locals.isAdmin = authRole === 'admin';
	next();
};

export const redirectAuthenticatedUser = (
	req: Request,
	res: Response,
	next: NextFunction,
): void => {
	if (getAuthSession(req)) {
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
	const authSession = getAuthSession(req);
	if (!authSession) {
		res.redirect('/login');
		return;
	}

	res.locals.authToken = authSession;
	next();
};

export const clearAuthSession = (res: Response): void => {
	res.clearCookie(AUTH_SESSION_COOKIE);
};