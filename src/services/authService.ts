import type { Request, Response } from 'express';
import jsonwebtoken, { type JwtPayload } from 'jsonwebtoken';

export const AUTH_SESSION_COOKIE = 'authSession';

export type AuthRole = 'admin' | 'applicant';

export type VerifiedAuthContext = {
	authSession: string;
	authRole: AuthRole;
};

const authContextCache = new WeakMap<Request, VerifiedAuthContext | null>();

const getJwtSecret = (): string | null => {
	const secret = process.env.JWT_SECRET ?? process.env.JWT_SECRET_KEY;
	if (!secret || secret.trim().length === 0) {
		return null;
	}

	return secret;
};

const parseCookies = (
	cookieHeader: string | undefined,
): Record<string, string> => {
	if (!cookieHeader) {
		return Object.create(null) as Record<string, string>;
	}

	return cookieHeader.split(';').reduce<Record<string, string>>(
		(acc, pair) => {
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
		},
		Object.create(null) as Record<string, string>,
	);
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

const resolveAuthRoleFromPayload = (payload: JwtPayload): AuthRole | null => {
	const claims = [
		...toStringArray(payload.role),
		...toStringArray(payload.roles),
		...toStringArray(payload.userType),
		...toStringArray(payload.permissions),
		...toStringArray(payload.scopes),
	].map((value) => value.trim().toLowerCase());

	if (claims.some((value) => value === 'admin')) {
		return 'admin';
	}

	if (claims.some((value) => value === 'applicant' || value === 'user')) {
		return 'applicant';
	}

	return null;
};

const validateAndDecodeAuthSession = (
	token: string,
): VerifiedAuthContext | null => {
	const secret = getJwtSecret();
	if (!secret) {
		return null;
	}

	let decoded: unknown;
	try {
		decoded = jsonwebtoken.verify(token, secret, { algorithms: ['HS256'] });
	} catch {
		return null;
	}

	if (typeof decoded !== 'object' || decoded === null) {
		return null;
	}

	const authRole = resolveAuthRoleFromPayload(decoded as JwtPayload);
	if (!authRole) {
		return null;
	}

	return {
		authSession: token,
		authRole,
	};
};

export const getVerifiedAuthContextFromToken = (
	token: string,
): VerifiedAuthContext | null => {
	return validateAndDecodeAuthSession(token);
};

export const getVerifiedAuthContext = (
	req: Request,
): VerifiedAuthContext | null => {
	if (authContextCache.has(req)) {
		return authContextCache.get(req) ?? null;
	}

	const authSession = getAuthSession(req);
	if (!authSession) {
		authContextCache.set(req, null);
		return null;
	}

	const authContext = validateAndDecodeAuthSession(authSession);
	authContextCache.set(req, authContext);
	return authContext;
};

export const getAuthSession = (req: Request): string | null => {
	const token = parseCookies(req.headers.cookie)[AUTH_SESSION_COOKIE];
	if (!token || token.trim().length === 0) {
		return null;
	}

	return token;
};

export const clearAuthSession = (res: Response): void => {
	const isProduction = process.env.NODE_ENV === 'production';
	res.clearCookie(AUTH_SESSION_COOKIE, {
		httpOnly: true,
		secure: isProduction,
		sameSite: 'strict',
		path: '/',
	});
};

export const setAuthSession = (
	res: Response,
	token: string,
	maxAge: number,
): void => {
	const isProduction = process.env.NODE_ENV === 'production';
	res.cookie(AUTH_SESSION_COOKIE, token, {
		httpOnly: true,
		secure: isProduction,
		sameSite: 'strict',
		path: '/',
		maxAge,
	});
};

export const getAuthCookieMaxAgeMs = (token: string): number | null => {
	const decoded = jsonwebtoken.decode(token);
	if (typeof decoded !== 'object' || decoded === null) {
		return null;
	}

	const exp = (decoded as JwtPayload).exp;
	if (typeof exp !== 'number' || !Number.isFinite(exp)) {
		return null;
	}

	const maxAge = exp * 1000 - Date.now();
	if (maxAge <= 0) {
		return null;
	}

	return maxAge;
};
