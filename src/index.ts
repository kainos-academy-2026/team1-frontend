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

const PORT = Number(process.env.PORT) || 4000;
const apiBaseUrl = requireApiBaseUrl();
const jobRoleService = new ApiJobRoleService(axios, apiBaseUrl);
const loginService = new LoginService(axios, apiBaseUrl);
const app = createApp(jobRoleService, loginService);

app.listen(PORT, () => {
	console.log(`Server is running on port ${PORT}`);
});
