import type { AxiosInstance } from 'axios';
import { describe, expect, it, vi } from 'vitest';
import { ApiUserService } from '../src/services/apiUserService';

describe('ApiUserService', () => {
	it('posts mapped user data to auth signup endpoint', async () => {
		const post = vi.fn().mockResolvedValue({ data: {} });
		const mapUserRequest = vi.fn().mockReturnValue({
			email: 'normalized@example.com',
			password: 'Password123!',
		});

		const service = new ApiUserService(
			{ post } as unknown as AxiosInstance,
			{ mapUserRequest } as never,
		);

		await service.createUser({
			email: ' Test@Example.com ',
			password: 'Password123!',
		});

		expect(mapUserRequest).toHaveBeenCalledWith({
			email: ' Test@Example.com ',
			password: 'Password123!',
		});
		expect(post).toHaveBeenCalledWith('/auth/signup', {
			email: 'normalized@example.com',
			password: 'Password123!',
		});
	});
});
