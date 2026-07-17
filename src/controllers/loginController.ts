import type { Request, Response } from 'express';
import type { LoginServiceClient } from '../services/loginService.js';

export class LoginController {
	constructor(private readonly loginService: LoginServiceClient) {}

	renderLoginPage = (req: Request, res: Response): void => {
		const loggedOut = req.query.loggedOut === '1';

		res.render('login.njk', {
			title: 'Login',
			logoutMessage: loggedOut
				? 'You have successfully logged out. Please log in again.'
				: undefined,
		});
	};

	handleLogin = async (req: Request, res: Response): Promise<void> => {
		const { email, password } = req.body as {
			email: string;
			password: string;
		};

		if (res.locals.errors) {
			res.render('login.njk', {
				title: 'Login',
			});
			return;
		}

		const response = await this.loginService.login({ email, password });

		if (!response) {
			res.render('login.njk', {
				loginError: 'Login failed. Please try again.',
			});

			return;
		}

		res.cookie('token', response.token);
		res.redirect('/');
	};

	handleLogout = (_req: Request, res: Response): void => {
		res.cookie('token', null);
		res.redirect('/auth/login?loggedOut=1');
	};
}
