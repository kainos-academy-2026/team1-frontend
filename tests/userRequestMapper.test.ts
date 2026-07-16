import { describe, expect, it } from 'vitest';
import { UserRequestMapper } from '../src/mappers/userRequestMapper';
import { UserRole } from '../src/models/userRole';

describe('UserRequestMapper', () => {
	const mapper = new UserRequestMapper();

	it('maps a user request DTO to API request DTO', () => {
		expect(
			mapper.mapUserRequest({
				email: 'person@example.com',
				password: 'Password123!',
			}),
		).toEqual({
			email: 'person@example.com',
			password: 'Password123!',
		});
	});

	it('maps API user response DTO to user model', () => {
		expect(
			mapper.mapApiUser({
				userId: 12,
				email: 'person@example.com',
				role: UserRole.User,
			}),
		).toEqual({
			userId: 12,
			email: 'person@example.com',
			role: UserRole.User,
		});
	});
});
