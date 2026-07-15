import 'dotenv/config';
import { createApp } from './app.js';
import { createApiHttpClient } from './config/createApiHttpClient.js';
import { requireApiBaseUrl } from './config/requireApiBaseUrl.js';
import { ApiJobRoleService } from './services/apiJobRoleService.js';
import { LoginService } from './services/loginService.js';

const apiBaseUrl = requireApiBaseUrl();
const apiHttpClient = createApiHttpClient();
const jobRoleService = new ApiJobRoleService(apiHttpClient, apiBaseUrl);
const loginService = new LoginService(apiHttpClient);
const app = createApp(jobRoleService, loginService);

const PORT = Number(process.env.PORT) || 3000;

app.listen(PORT, () => {
	console.log(`Server is running on port ${PORT}`);
});
