import type { LoginCredentials } from './loginCredentials.js';
import type { LoginResponse } from './loginResponse.js';

export interface LoginServiceClient {
	login(credentials: LoginCredentials): Promise<LoginResponse>;
}
