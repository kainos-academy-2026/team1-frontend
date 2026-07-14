import 'dotenv/config';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import axios from 'axios';
import express from 'express';
import nunjucks from 'nunjucks';
import { requireApiBaseUrl } from './config/requireApiBaseUrl.js';
import { RegistrationController } from './controllers/registrationController.js';
import { errorHandler } from './errors/errorHandler.js';
import jobRoleRouter from './routers/jobRoleRouter.js';
import { registrationRouter } from './routers/registrationRouter.js';
import { ApiUserService } from './services/apiUserService.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();

const viewsPath = path.join(__dirname, 'views');
const assetsPath = path.join(__dirname, '..', 'assets');

nunjucks.configure(viewsPath, {
	autoescape: true,
	express: app,
});

app.use(express.urlencoded({ extended: true }));
app.use('/assets', express.static(assetsPath));

app.get('/', (_req, res) => {
	res.render('index.njk', { title: 'Home' });
});

const apiBaseUrl = requireApiBaseUrl();
const userService = new ApiUserService(axios, apiBaseUrl);
const registrationController = new RegistrationController(userService);

app.use('/job-roles', jobRoleRouter);
app.use('/registration', registrationRouter(registrationController));
app.use(errorHandler);

export default app;
