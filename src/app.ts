import path from 'node:path';
import { fileURLToPath } from 'node:url';
import express from 'express';
import nunjucks from 'nunjucks';
import { JobRoleController } from './controllers/jobRoleController';
import { errorHandler } from './errors/errorHandler';
import { jobRoleRouter } from './routers/jobRoleRouter';
import type { JobRoleService } from './services/jobRoleService';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

export const createApp = (jobRoleService: JobRoleService) => {
	const app = express();

	const viewsPath = path.join(__dirname, 'views');
	const assetsPath = path.join(__dirname, '..', 'assets');

	nunjucks.configure(viewsPath, {
		autoescape: true,
		express: app,
	});

	app.use('/assets', express.static(assetsPath));

	app.get('/', (_req, res) => {
		res.render('index.njk', { title: 'Home' });
	});

	app.get('/login', (_req, res) => {
		res.render('login.njk', { title: 'Login' });
	});

	const jobRoleController = new JobRoleController(jobRoleService);
	app.use('/job-roles', jobRoleRouter(jobRoleController));

	app.use(errorHandler);

	return app;
};
