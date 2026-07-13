import 'dotenv/config';
import axios from 'axios';
import { createApp } from './app.js';
import { ApiJobRoleService } from './services/apiJobRoleService.js';
import { ApiUserService } from './services/apiUserService.js';

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
const userService = new ApiUserService(axios, apiBaseUrl);
const app = createApp(jobRoleService, userService);

app.listen(PORT, () => {
	console.log(`Server is running on port ${PORT}`);
});
