import type { AxiosInstance } from 'axios';
import type { LoginCredentials } from '../models/loginCredentials.js';
import type { LoginResponse } from '../models/loginResponse.js';

export type { LoginServiceClient } from '../models/loginServiceClient.js';

import type { LoginServiceClient } from '../models/loginServiceClient.js';

export class LoginService implements LoginServiceClient {
	constructor(private readonly httpClient: AxiosInstance) {}

	async login(credentials: LoginCredentials): Promise<LoginResponse> {
		const response = await this.httpClient.post<LoginResponse>('/auth/login', {
			email: credentials.email.trim().toLowerCase(),
			password: credentials.password,
		});

		return response.data;
	}
}
