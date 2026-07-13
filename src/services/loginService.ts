import type { AxiosInstance } from 'axios';

export interface LoginCredentials {
	email: string;
	password: string;
}

export interface LoginResponse {
	token: string;
}

export interface LoginServiceClient {
	login(credentials: LoginCredentials): Promise<LoginResponse>;
}

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
