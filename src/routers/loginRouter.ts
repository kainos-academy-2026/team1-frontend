import {
	type NextFunction,
	type Request,
	type Response,
	Router,
} from 'express';
import { z } from 'zod';
import type { LoginController } from '../controllers/loginController.js';
import { redirectAuthenticatedUser } from './authRouter.js';

type FieldErrors = Record<string, string[]>;

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
		const errors: FieldErrors = {};

		for (const issue of result.error.issues) {
			const field = issue.path?.[0];
			if (typeof field !== 'string') {
				continue;
			}

			const existingMessages = errors[field] ?? [];
			if (!existingMessages.includes(issue.message)) {
				existingMessages.push(issue.message);
			}
			errors[field] = existingMessages;
		}

		res.status(400).render('login.njk', {
			title: 'Login',
			loginError: 'Enter a valid email address that includes an @ symbol.',
			errors,
			formData: {
				email: typeof req.body?.email === 'string' ? req.body.email : '',
			},
		});
		return;
	}

	res.locals.loginForm = result.data;
	next();
};

export const loginRouter = (loginController: LoginController): Router => {
	const router = Router();

	router.get('/', redirectAuthenticatedUser, loginController.renderLoginPage);
	router.post('/', validateLoginForm, loginController.handleLogin);
	router.post('/logout', loginController.handleLogout);

	return router;
};
