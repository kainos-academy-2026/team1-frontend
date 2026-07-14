import type { AxiosInstance } from 'axios';
import type { UserRequestMapper } from '../mappers/userRequestMapper.js';
import type { UserRequestDto } from '../models/userRequestDto.js';
import type { UserService } from './userService.js';

export class ApiUserService implements UserService {
	constructor(
		private readonly httpClient: AxiosInstance,
		private readonly apiBaseUrl: string,
		private readonly userRequestMapper: UserRequestMapper,
	) {}

	async createUser(data: UserRequestDto): Promise<void> {
		await this.httpClient.post(
			`${this.apiBaseUrl}/auth/signup`,
			this.userRequestMapper.mapUserRequest(data),
		);
	}
}
