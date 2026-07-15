import type { UserRequestDto } from '../models/userRequestDto.js';

export interface UserService {
	createUser(data: UserRequestDto): Promise<void>;
}
