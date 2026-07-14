import 'dotenv/config';
import axios from 'axios';
import { createApp } from './app';
import { ApiJobRoleService } from './services/apiJobRoleService';
import { LoginService } from './services/loginService';

const requireApiBaseUrl = (): string => {
	if (!process.env.API_BASE_URL) {
		throw new Error(
			'API_BASE_URL is required. Set it in your environment before starting the app.',
		);
	}

	return process.env.API_BASE_URL;
};

// Ensure JWT_SECRET is set (required for auth verification)
if (!process.env.JWT_SECRET) {
	if (process.env.NODE_ENV === 'production') {
		throw new Error(
			'JWT_SECRET is required in production. Set it in your environment.',
		);
	}
	// Use a default for development
	process.env.JWT_SECRET = 'dev-jwt-secret-at-least-32-characters-long';
}

const PORT = Number(process.env.PORT) || 4000;
const apiBaseUrl = requireApiBaseUrl();
const jobRoleService = new ApiJobRoleService(axios, apiBaseUrl);
const loginService = new LoginService(axios, apiBaseUrl);
const app = createApp(jobRoleService, loginService);

app.listen(PORT, () => {
	console.log(`Server is running on port ${PORT}`);
});
