import axios from 'axios';
import { describe, expect, it, vi } from 'vitest';
import { errorHandler } from '../src/errors/errorHandler';
import { ValidationError } from '../src/errors/validationError';

const createResponse = (locals: Record<string, unknown> = {}) => {
	const response = {
		locals,
		status: vi.fn().mockReturnThis(),
		render: vi.fn(),
	};

	return response;
};

describe('errorHandler', () => {
	it('renders upstream data error for ValidationError using default redirect options', () => {
		const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {});
		const res = createResponse();

		errorHandler(
			new ValidationError('bad data'),
			{} as never,
			res as never,
			vi.fn(),
		);

		expect(consoleSpy).toHaveBeenCalled();
		expect(res.status).toHaveBeenCalledWith(502);
		expect(res.render).toHaveBeenCalledWith('errors/error-page.njk', {
			title: 'Upstream data error',
			message: 'The job data received from the upstream API was invalid.',
			redirectHref: '/job-roles',
			redirectText: 'Back to open roles',
		});
		consoleSpy.mockRestore();
	});

	it('renders upstream API error for AxiosError with custom redirect options', () => {
		const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {});
		const res = createResponse({
			errorRedirect: {
				redirectHref: '/auth/login',
				redirectText: 'Back to login',
			},
		});

		errorHandler(
			new axios.AxiosError('upstream failed'),
			{} as never,
			res as never,
			vi.fn(),
		);

		expect(consoleSpy).toHaveBeenCalled();
		expect(res.status).toHaveBeenCalledWith(502);
		expect(res.render).toHaveBeenCalledWith('errors/error-page.njk', {
			title: 'Upstream API error',
			message: 'There was a problem contacting the upstream job roles API.',
			redirectHref: '/auth/login',
			redirectText: 'Back to login',
		});
		consoleSpy.mockRestore();
	});

	it('falls back to default redirect options when custom options are empty or invalid', () => {
		const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {});
		const res = createResponse({
			errorRedirect: {
				redirectHref: '   ',
				redirectText: 42,
			},
		});

		errorHandler(new Error('boom'), {} as never, res as never, vi.fn());

		expect(consoleSpy).toHaveBeenCalled();
		expect(res.status).toHaveBeenCalledWith(500);
		expect(res.render).toHaveBeenCalledWith('errors/error-page.njk', {
			title: 'Internal server error',
			message: 'An unexpected error occurred. Please try again.',
			redirectHref: '/job-roles',
			redirectText: 'Back to open roles',
		});
		consoleSpy.mockRestore();
	});
});
