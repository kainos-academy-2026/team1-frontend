import axios from 'axios';
import {
	type NextFunction,
	type Request,
	type Response,
	Router,
} from 'express';
import { z } from 'zod';
import { requireApiBaseUrl } from '../config/requireApiBaseUrl.js';
import { LoginController } from '../controllers/loginController.js';
import { LoginService } from '../services/loginService.js';

const loginFormSchema = z.object({
	email: z.string().trim().email(),
	password: z.string().min(1),
});

const validateLoginForm = (
	req: Request,
	res: Response,
	next: NextFunction,
): void => {
	const result = loginFormSchema.safeParse(req.body);

	if (!result.success) {
		res.status(400).render('login.njk', {
			title: 'Login',
			loginError: 'Enter a valid email address that includes an @ symbol.',
		});
		return;
	}

	res.locals.loginForm = result.data;
	next();
};

const apiBaseUrl = requireApiBaseUrl();
const loginService = new LoginService(axios, apiBaseUrl);
const loginController = new LoginController(loginService);

const router = Router();

router.get('/', loginController.renderLoginPage);
router.post('/', validateLoginForm, loginController.handleLogin);

export default router;
