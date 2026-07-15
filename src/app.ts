import 'dotenv/config';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import express from 'express';
import nunjucks from 'nunjucks';
import { errorHandler } from './errors/errorHandler.js';
import jobRoleRouter from './routers/jobRoleRouter.js';
import loginRouter from './routers/loginRouter.js';
import registrationRouter from './routers/registrationRouter.js';

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

app.use('/job-roles', jobRoleRouter);
app.use('/login', loginRouter);
app.use('/registration', registrationRouter);

app.use(errorHandler);

export default app;
