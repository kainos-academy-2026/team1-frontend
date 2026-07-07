import path from 'node:path';
import { fileURLToPath } from 'node:url';
import type { Request, Response } from 'express';
import express from 'express';
import nunjucks from 'nunjucks';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

export const app = express();

const viewsPath = path.join(__dirname, 'views');

nunjucks.configure(viewsPath, {
	autoescape: true,
	express: app,
});

app.get('/', (req: Request, res: Response) => {
	res.render('layouts/base.njk', { title: 'Home' });
});
