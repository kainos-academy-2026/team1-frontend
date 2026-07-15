import path from 'node:path';
import { fileURLToPath } from 'node:url';
import express from 'express';
import nunjucks from 'nunjucks';
import { JobRoleController } from './controllers/jobRoleController.js';
import { LoginController } from './controllers/loginController.js';
import { errorHandler } from './errors/errorHandler.js';
import { attachAuthState } from './middleware/auth.js';
import { jobRoleRouter } from './routers/jobRoleRouter.js';
import { loginRouter } from './routers/loginRouter.js';
import registrationRouter from './routers/registrationRouter.js';
import type { JobRoleService } from './services/jobRoleService.js';
import type { LoginServiceClient } from './services/loginService.js';

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
	app.use((req, res, next) => {
		if (req.path.startsWith('/assets')) {
			return next();
		}
		attachAuthState(req, res, next);
	});

	app.get('/', (_req, res) => {
		res.render('index.njk', { title: 'Home' });
	});

	const loginController = new LoginController(loginService);
	app.use('/login', loginRouter(loginController));
	app.use('/registration', registrationRouter);

	const jobRoleController = new JobRoleController(jobRoleService);
	app.use('/job-roles', jobRoleRouter(jobRoleController));

	app.use(errorHandler);

	return app;
};
