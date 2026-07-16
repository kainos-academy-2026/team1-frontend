import { describe, expect, it, vi } from 'vitest';
import authoriseRoles from '../src/middleware/authoriseRoles';
import userInfo from '../src/middleware/userInfo';
import { Role } from '../src/models/role';
import { createAuthToken } from './helpers/authToken';

const createResponse = () => ({
	locals: {},
	redirect: vi.fn(),
	cookie: vi.fn(),
	status: vi.fn().mockReturnThis(),
});

describe('authoriseRoles middleware', () => {
	it('redirects to login when token is missing', () => {
		const middleware = authoriseRoles([Role.Admin, Role.User]);
		const res = createResponse();
		const next = vi.fn();

		middleware({ cookies: {} } as never, res as never, next);

		expect(res.redirect).toHaveBeenCalledWith('/auth/login');
		expect(next).not.toHaveBeenCalled();
	});

	it('redirects to login when token is empty', () => {
		const middleware = authoriseRoles([Role.Admin, Role.User]);
		const res = createResponse();
		const next = vi.fn();

		middleware({ cookies: { token: '' } } as never, res as never, next);

		expect(res.redirect).toHaveBeenCalledWith('/auth/login');
		expect(next).not.toHaveBeenCalled();
	});

	it('redirects to login when token is a truthy empty String object', () => {
		const middleware = authoriseRoles([Role.Admin, Role.User]);
		const res = createResponse();
		const next = vi.fn();

		middleware(
			{ cookies: { token: new String('') as unknown as string } } as never,
			res as never,
			next,
		);

		expect(res.redirect).toHaveBeenCalledWith('/auth/login');
		expect(next).not.toHaveBeenCalled();
	});

	it('returns 403 when token role is not allowed', () => {
		const middleware = authoriseRoles([Role.Admin]);
		const res = createResponse();
		const next = vi.fn();

		middleware(
			{ cookies: { token: createAuthToken('USER') } } as never,
			res as never,
			next,
		);

		expect(res.status).toHaveBeenCalledWith(403);
		expect(next).not.toHaveBeenCalled();
	});
});

describe('userInfo middleware', () => {
	it('leaves user null when token is missing', () => {
		const res = createResponse();
		const next = vi.fn();

		userInfo({ cookies: {} } as never, res as never, next);

		expect(res.locals.user).toBeNull();
		expect(next).toHaveBeenCalled();
	});

	it('leaves user null when token is empty', () => {
		const res = createResponse();
		const next = vi.fn();

		userInfo({ cookies: { token: '' } } as never, res as never, next);

		expect(res.locals.user).toBeNull();
		expect(next).toHaveBeenCalled();
	});

	it('leaves user null when token is a truthy empty String object', () => {
		const res = createResponse();
		const next = vi.fn();

		userInfo(
			{ cookies: { token: new String('') as unknown as string } } as never,
			res as never,
			next,
		);

		expect(res.locals.user).toBeNull();
		expect(next).toHaveBeenCalled();
	});
});
