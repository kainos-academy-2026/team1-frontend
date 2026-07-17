import path from 'node:path';
import { fileURLToPath } from 'node:url';
import cookieParser from 'cookie-parser';
import express from 'express';
import nunjucks from 'nunjucks';
import { errorHandler } from './errors/errorHandler.js';
import userInfo from './middleware/userInfo.js';
import jobRoleRouter from './routers/jobRoleRouter.js';
import loginRouter from './routers/loginRouter.js';
import registrationRouter from './routers/registrationRouter.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();

const viewsPath = path.join(__dirname, 'views');
const assetsPath = path.join(__dirname, '..', 'assets');

app.set('views', viewsPath);
app.set('view engine', 'njk');

nunjucks.configure(viewsPath, {
	autoescape: true,
	express: app,
	noCache: process.env.NODE_ENV !== 'production',
});

app.use(express.urlencoded({ extended: false }));
app.use(express.json());
app.use(cookieParser());

app.use('/assets', express.static(assetsPath));

app.use(userInfo);

app.get('/', (_req, res) => {
	res.render('index.njk', { title: 'Home' });
});

app.use('/auth', loginRouter);
app.use('/registration', registrationRouter);
app.use('/job-roles', jobRoleRouter);

app.use(errorHandler);

export default app;
