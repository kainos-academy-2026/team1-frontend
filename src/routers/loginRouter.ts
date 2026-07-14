import {
	type NextFunction,
	type Request,
	type Response,
	Router,
} from 'express';
import { z } from 'zod';
import type { LoginController } from '../controllers/loginController';

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

export const loginRouter = (loginController: LoginController): Router => {
	const router = Router();

	router.get('/', loginController.renderLoginPage);
	router.post('/', validateLoginForm, loginController.handleLogin);

	return router;
};
