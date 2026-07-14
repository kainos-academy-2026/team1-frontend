import path from 'node:path';
import { fileURLToPath } from 'node:url';
import express from 'express';
import nunjucks from 'nunjucks';
import { JobRoleController } from './controllers/jobRoleController';
import { LoginController } from './controllers/loginController';
import { errorHandler } from './errors/errorHandler';
import { attachAuthState, requireAuthenticatedUser } from './routers/authRouter';
import { jobRoleRouter } from './routers/jobRoleRouter';
import { loginRouter } from './routers/loginRouter';
import type { JobRoleService } from './services/jobRoleService';
import type { LoginServiceClient } from './services/loginService';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

export const createApp = (
	jobRoleService: JobRoleService,
	loginService?: LoginServiceClient,
) => {
	const app = express();

	const viewsPath = path.join(__dirname, 'views');
	const assetsPath = path.join(__dirname, '..', 'assets');

	nunjucks.configure(viewsPath, {
		autoescape: true,
		express: app,
		noCache: process.env.NODE_ENV !== 'production',
	});

	app.use('/assets', express.static(assetsPath));
	app.use(express.urlencoded({ extended: false }));
	app.use(express.json());
	app.use(attachAuthState);

	app.get('/', requireAuthenticatedUser, (_req, res) => {
		res.render('index.njk', { title: 'Home' });
	});

	const loginController = new LoginController(loginService);
	app.use('/login', loginRouter(loginController));

	const jobRoleController = new JobRoleController(jobRoleService);
	app.use('/job-roles', requireAuthenticatedUser, jobRoleRouter(jobRoleController));

	app.use(errorHandler);

	return app;
};
