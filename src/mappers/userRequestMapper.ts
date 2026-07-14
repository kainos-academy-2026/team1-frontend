import { ValidationError } from '../errors/validationError.js';
import type { User } from '../models/user.js';
import type {
	CreateUserApiRequestDto,
	CreateUserApiResponseDto,
} from '../models/userApiDto.js';
import type { UserRequestDto } from '../models/userRequestDto.js';
import { UserRole } from '../models/userRole.js';

export class UserRequestMapper {
	mapUserRequest(userRequestDto: UserRequestDto): CreateUserApiRequestDto {
		return {
			email: userRequestDto.email,
			password: userRequestDto.password,
		};
	}

	mapApiUser(apiUser: CreateUserApiResponseDto): User {
		const userId = apiUser.userId;
		if (!userId || userId <= 0) {
			throw new ValidationError('Missing user ID.');
		}

		return {
			userId,
			email: apiUser.email,
			role: UserRole.User,
		};
	}
}
