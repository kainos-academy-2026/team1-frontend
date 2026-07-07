import path from 'node:path';
import { fileURLToPath } from 'node:url';
import express from 'express';
import nunjucks from 'nunjucks';
import { JobRoleController } from './jobRoleController';
import { createJobRoleRouter } from './jobRoleRouter';
import { ApiJobRoleService, type JobRoleService } from './jobRoleService';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

export const createApp = (jobRoleService?: JobRoleService) => {
	const app = express();

	const viewsPath = path.join(__dirname, 'views');

	nunjucks.configure(viewsPath, {
		autoescape: true,
		express: app,
	});

	app.get('/', (_req, res) => {
		res.render('layouts/base.njk', { title: 'Home' });
	});

	const resolvedJobRoleService = jobRoleService ?? new ApiJobRoleService();
	const jobRoleController = new JobRoleController(resolvedJobRoleService);
	app.use('/job-roles', createJobRoleRouter(jobRoleController));

	return app;
};
