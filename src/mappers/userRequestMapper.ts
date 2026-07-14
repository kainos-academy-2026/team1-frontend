import type { User } from '../models/user.js';
import type {
	CreateUserApiRequestDto,
	CreateUserApiResponseDto,
} from '../models/userApiDto.js';
import type { UserRequestDto } from '../models/userRequestDto.js';

export class UserRequestMapper {
	mapUserRequest(userRequestDto: UserRequestDto): CreateUserApiRequestDto {
		return {
			email: userRequestDto.email,
			password: userRequestDto.password,
		};
	}

	mapApiUser(apiUser: CreateUserApiResponseDto): User {
		return {
			userId: apiUser.userId,
			email: apiUser.email,
			role: apiUser.role,
		};
	}
}
