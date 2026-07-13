import type { AxiosInstance } from 'axios';
import type { LoginCredentials } from '../models/loginCredentials';
import type { LoginResponse } from '../models/loginResponse';
export type { LoginServiceClient } from '../models/loginServiceClient';
import type { LoginServiceClient } from '../models/loginServiceClient';

export class LoginService implements LoginServiceClient {
	constructor(
		private readonly httpClient: AxiosInstance,
		private readonly apiBaseUrl: string,
	) {}

	async login(credentials: LoginCredentials): Promise<LoginResponse> {
		const response = await this.httpClient.post<LoginResponse>(
			`${this.apiBaseUrl}/auth/login`,
			{
				email: credentials.email.trim().toLowerCase(),
				password: credentials.password,
			},
		);

		return response.data;
	}
}
