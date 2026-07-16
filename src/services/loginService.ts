import type { AxiosInstance } from 'axios';
import type { LoginCredentials } from '../models/loginCredentials.js';
import type { LoginResponse } from '../models/loginResponse.js';

export type { LoginServiceClient } from '../models/loginServiceClient.js';

import axios from 'axios';
import type { LoginServiceClient } from '../models/loginServiceClient.js';

export class LoginService implements LoginServiceClient {
	constructor(private readonly httpClient: AxiosInstance) {}

	async login(credentials: LoginCredentials): Promise<LoginResponse | null> {
		try {
			const response = await this.httpClient.post<LoginResponse>(
				'/auth/login',
				{
					email: credentials.email.trim().toLowerCase(),
					password: credentials.password,
				},
			);

			return response.data;
		} catch (error) {
			if (axios.isAxiosError(error)) {
				if (error.response?.status === 401) {
					return null;
				}
			}

			throw error;
		}
	}
}
