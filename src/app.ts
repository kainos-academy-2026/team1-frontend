import 'dotenv/config';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import axios from 'axios';
import express from 'express';
import nunjucks from 'nunjucks';
import { requireApiBaseUrl } from './config/requireApiBaseUrl.js';
import { JobRoleController } from './controllers/jobRoleController.js';
import { LoginController } from './controllers/loginController.js';
import { RegistrationController } from './controllers/registrationController.js';
import { errorHandler } from './errors/errorHandler.js';
import { jobRoleRouter } from './routers/jobRoleRouter.js';
import { loginRouter } from './routers/loginRouter.js';
import { registrationRouter } from './routers/registrationRouter.js';
import { ApiJobRoleService } from './services/apiJobRoleService.js';
import { ApiUserService } from './services/apiUserService.js';
import { LoginService } from './services/loginService.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();

const viewsPath = path.join(__dirname, 'views');
const assetsPath = path.join(__dirname, '..', 'assets');

nunjucks.configure(viewsPath, {
	autoescape: true,
	express: app,
	noCache: process.env.NODE_ENV !== 'production',
});

app.use('/assets', express.static(assetsPath));
app.use(express.urlencoded({ extended: true }));
app.use(express.json());

app.get('/', (_req, res) => {
	res.render('index.njk', { title: 'Home' });
});

const apiBaseUrl = requireApiBaseUrl();
const userService = new ApiUserService(axios, apiBaseUrl);
const loginService = new LoginService(axios, apiBaseUrl);
const jobRoleService = new ApiJobRoleService(axios, apiBaseUrl);

const registrationController = new RegistrationController(userService);
const jobRoleController = new JobRoleController(jobRoleService);
const loginController = new LoginController(loginService);

app.use('/job-roles', jobRoleRouter(jobRoleController));
app.use('/login', loginRouter(loginController));
app.use('/registration', registrationRouter(registrationController));

app.use(errorHandler);

export default app;
