import type { LoginCredentials } from './loginCredentials';
import type { LoginResponse } from './loginResponse';

export interface LoginServiceClient {
	login(credentials: LoginCredentials): Promise<LoginResponse>;
}
