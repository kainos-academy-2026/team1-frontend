import path from 'node:path';
import { fileURLToPath } from 'node:url';
import express from 'express';
import nunjucks from 'nunjucks';
import { JobRoleController } from './controllers/jobRoleController.js';
import { RegistrationController } from './controllers/registrationController.js';
import { errorHandler } from './errors/errorHandler.js';
import { jobRoleRouter } from './routers/jobRoleRouter.js';
import { registrationRouter } from './routers/registrationRouter.js';
import type { JobRoleService } from './services/jobRoleService.js';
import type { UserService } from './services/userService.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

export const createApp = (
	jobRoleService: JobRoleService,
	userService?: UserService,
) => {
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

	const jobRoleController = new JobRoleController(jobRoleService);
	app.use('/job-roles', jobRoleRouter(jobRoleController));

	if (userService) {
		const registrationController = new RegistrationController(userService);
		app.use('/registration', registrationRouter(registrationController));
	} else {
		app.get('/registration', (_req, res) => {
			res.render('registration.njk', {
				title: 'Register',
				formData: { email: '' },
			});
		});
	}

	app.use(errorHandler);

	return app;
};
