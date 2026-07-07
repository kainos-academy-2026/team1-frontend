import 'dotenv/config';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import type { Request, Response } from 'express';
import express from 'express';
import nunjucks from 'nunjucks';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = Number(process.env.PORT) || 4000;

// Set up Nunjucks as the template engine
const viewsPath = path.join(__dirname, 'views');

nunjucks.configure(viewsPath, {
	autoescape: true,
	express: app,
});

// Route for the home page
app.get('/', (req: Request, res: Response) => {
	res.render('layouts/base.njk', { title: 'Home' });
});

app.listen(PORT, () => {
	console.log(`Server is running on port ${PORT}`);
});
