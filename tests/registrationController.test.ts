import axios from 'axios';
import { describe, expect, it, vi } from 'vitest';
import { RegistrationController } from '../src/controllers/registrationController';

const createResponse = () => {
	const response = {
		locals: {},
		status: vi.fn().mockReturnThis(),
		render: vi.fn().mockReturnThis(),
		redirect: vi.fn(),
	};

	return response;
};

describe('RegistrationController', () => {
	it('calls next for unmapped Axios errors', async () => {
		const userService = {
			createUser: vi.fn().mockRejectedValue(
				new axios.AxiosError('Unexpected', undefined, undefined, undefined, {
					status: 418,
					statusText: 'I am a teapot',
					headers: {},
					config: {} as never,
					data: {},
				}),
			),
		};
		const controller = new RegistrationController(userService as never);
		const req = {
			body: { email: 'person@example.com', password: 'Password123!' },
		};
		const res = createResponse();
		const next = vi.fn();

		await controller.register(req as never, res as never, next);

		expect(next).toHaveBeenCalled();
		expect(res.render).not.toHaveBeenCalled();
	});

	it('calls next for non-Axios errors', async () => {
		const userService = {
			createUser: vi.fn().mockRejectedValue(new Error('boom')),
		};
		const controller = new RegistrationController(userService as never);
		const req = {
			body: { email: 'person@example.com', password: 'Password123!' },
		};
		const res = createResponse();
		const next = vi.fn();

		await controller.register(req as never, res as never, next);

		expect(next).toHaveBeenCalledWith(expect.any(Error));
	});
});
