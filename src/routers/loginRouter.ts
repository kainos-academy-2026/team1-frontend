import {
	type NextFunction,
	type Request,
	type Response,
	Router,
} from 'express';
import type { LoginController } from '../controllers/loginController.js';
import { setErrorRedirect } from '../middleware/errorRedirect.js';
import { loginCredentialsSchema } from '../validators/loginCredentialsValidator.js';
import { redirectAuthenticatedUser } from './authRouter.js';

type FieldErrors = Record<string, string[]>;

const toLoginErrorMessage = (errors: FieldErrors): string => {
	const hasEmailError = Boolean(errors.email && errors.email.length > 0);
	const hasPasswordError = Boolean(
		errors.password && errors.password.length > 0,
	);

	if (hasEmailError && !hasPasswordError) {
		return 'Enter a valid email address that includes an @ symbol.';
	}

	if (hasPasswordError && !hasEmailError) {
		return 'Enter your password.';
	}

	return 'Enter a valid email address and password.';
};

const validateLoginForm = (
	req: Request,
	res: Response,
	next: NextFunction,
): void => {
	const result = loginCredentialsSchema.safeParse(req.body);

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
			loginError: toLoginErrorMessage(errors),
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
	router.use(setErrorRedirect('/login', 'Back to login'));

	router.get('/', redirectAuthenticatedUser, loginController.renderLoginPage);
	router.post('/', validateLoginForm, loginController.handleLogin);
	router.post('/logout', loginController.handleLogout);

	return router;
};
