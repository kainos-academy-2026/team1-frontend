import type { AxiosInstance } from 'axios';
import axios from 'axios';
import { describe, expect, it, vi } from 'vitest';
import { LoginService } from '../src/services/loginService';

describe('LoginService', () => {
	it('posts credentials to the confirmed auth login endpoint', async () => {
		const post = vi.fn().mockResolvedValue({
			data: { token: 'jwt-token' },
		});
		const service = new LoginService({ post } as unknown as AxiosInstance);

		await expect(
			service.login({
				email: ' Test@Example.com ',
				password: 'Password123!',
			}),
		).resolves.toEqual({ token: 'jwt-token' });

		expect(post).toHaveBeenCalledWith('/auth/login', {
			email: 'test@example.com',
			password: 'Password123!',
		});
	});

	it('returns null for 401 responses', async () => {
		const post = vi.fn().mockRejectedValue(
			new axios.AxiosError('Unauthorized', undefined, undefined, undefined, {
				status: 401,
				statusText: 'Unauthorized',
				headers: {},
				config: {} as never,
				data: {},
			}),
		);
		const service = new LoginService({ post } as unknown as AxiosInstance);

		await expect(
			service.login({ email: 'person@example.com', password: 'Password123!' }),
		).resolves.toBeNull();
	});

	it('rethrows non-401 Axios errors', async () => {
		const post = vi.fn().mockRejectedValue(
			new axios.AxiosError('Server error', undefined, undefined, undefined, {
				status: 500,
				statusText: 'Internal Server Error',
				headers: {},
				config: {} as never,
				data: {},
			}),
		);
		const service = new LoginService({ post } as unknown as AxiosInstance);

		await expect(
			service.login({ email: 'person@example.com', password: 'Password123!' }),
		).rejects.toBeInstanceOf(axios.AxiosError);
	});

	it('rethrows non-Axios errors', async () => {
		const post = vi.fn().mockRejectedValue(new Error('unexpected failure'));
		const service = new LoginService({ post } as unknown as AxiosInstance);

		await expect(
			service.login({ email: 'person@example.com', password: 'Password123!' }),
		).rejects.toThrow('unexpected failure');
	});
});
