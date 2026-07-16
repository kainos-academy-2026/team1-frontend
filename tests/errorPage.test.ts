import { describe, expect, it, vi } from 'vitest';
import {
	renderErrorPage,
	renderInvalidJobRoleIdError,
	renderJobRoleNotFoundError,
} from '../src/errors/errorPage';

const createResponse = () => {
	const response = {
		status: vi.fn().mockReturnThis(),
		render: vi.fn(),
	};

	return response;
};

describe('errorPage helpers', () => {
	it('renders an error page using defaults when redirect values are not provided', () => {
		const res = createResponse();

		renderErrorPage(res as never, {
			status: 500,
			title: 'Internal server error',
			message: 'Unexpected failure',
		});

		expect(res.status).toHaveBeenCalledWith(500);
		expect(res.render).toHaveBeenCalledWith('errors/error-page.njk', {
			title: 'Internal server error',
			message: 'Unexpected failure',
			redirectHref: '/job-roles',
			redirectText: 'Back to open roles',
		});
	});

	it('normalizes redirectHref when it does not start with a slash', () => {
		const res = createResponse();

		renderErrorPage(res as never, {
			status: 400,
			title: 'Bad request',
			message: 'Invalid input',
			redirectHref: 'auth/login',
			redirectText: 'Back to login',
		});

		expect(res.render).toHaveBeenCalledWith('errors/error-page.njk', {
			title: 'Bad request',
			message: 'Invalid input',
			redirectHref: '/auth/login',
			redirectText: 'Back to login',
		});
	});

	it('falls back to default redirect href when redirectHref is an empty string', () => {
		const res = createResponse();

		renderErrorPage(res as never, {
			status: 400,
			title: 'Bad request',
			message: 'Invalid input',
			redirectHref: '   ',
			redirectText: 'Back to login',
		});

		expect(res.render).toHaveBeenCalledWith('errors/error-page.njk', {
			title: 'Bad request',
			message: 'Invalid input',
			redirectHref: '/job-roles',
			redirectText: 'Back to login',
		});
	});

	it('renders invalid job role id error page', () => {
		const res = createResponse();

		renderInvalidJobRoleIdError(res as never);

		expect(res.status).toHaveBeenCalledWith(400);
		expect(res.render).toHaveBeenCalledWith('errors/error-page.njk', {
			title: 'Bad request',
			message: 'Invalid job role ID provided.',
			redirectHref: '/job-roles',
			redirectText: 'Back to open roles',
		});
	});

	it('renders job role not found error page', () => {
		const res = createResponse();

		renderJobRoleNotFoundError(res as never);

		expect(res.status).toHaveBeenCalledWith(404);
		expect(res.render).toHaveBeenCalledWith('errors/error-page.njk', {
			title: 'Job role not found',
			message: 'The job role you requested could not be found.',
			redirectHref: '/job-roles',
			redirectText: 'Back to open roles',
		});
	});
});
