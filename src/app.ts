import path from 'node:path';
import { fileURLToPath } from 'node:url';
import express from 'express';
import nunjucks from 'nunjucks';
import { ApiJobRoleService } from './features/job-roles/apiJobRoleService';
import { JobRoleController } from './features/job-roles/jobRoleController';
import { jobRoleRouter } from './features/job-roles/jobRoleRouter';
import type { JobRoleService } from './features/job-roles/jobRoleService';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

export const createApp = (jobRoleService?: JobRoleService) => {
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

	const resolvedJobRoleService = jobRoleService ?? new ApiJobRoleService();
	const jobRoleController = new JobRoleController(resolvedJobRoleService);
	app.use('/job-roles', jobRoleRouter(jobRoleController));

	return app;
};
