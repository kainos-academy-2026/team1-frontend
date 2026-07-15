import type { AxiosInstance } from 'axios';
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
});
