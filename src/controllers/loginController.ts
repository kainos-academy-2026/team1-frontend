import axios from 'axios';
import type { Request, Response } from 'express';
import type { BackendValidationError } from '../models/backendValidation';
import { clearAuthSession } from '../routers/authRouter';
import type { LoginServiceClient } from '../services/loginService';

export class LoginController {
	constructor(private readonly loginService?: LoginServiceClient) {}

	renderLoginPage = (req: Request, res: Response): void => {
		const loggedOut = req.query.loggedOut === '1';

		res.render('login.njk', {
			title: 'Login',
			logoutMessage: loggedOut
				? 'You have successfully logged out. Please log in again.'
				: undefined,
		});
	};

	handleLogin = async (_req: Request, res: Response): Promise<void> => {
		if (!this.loginService) {
			res.status(503).render('login.njk', {
				title: 'Login',
				loginError: 'Login service is not available yet.',
			});
			return;
		}

		const { email, password } = res.locals.loginForm as {
			email: string;
			password: string;
		};

		try {
			const { token } = await this.loginService.login({ email, password });
			res.set('Cache-Control', 'no-store');
			const isProduction = process.env.NODE_ENV === 'production';
			res.cookie('authSession', token, {
				httpOnly: true,
				secure: isProduction,
				sameSite: 'strict',
			});
			res.redirect('/job-roles');
		} catch (error) {
			if (axios.isAxiosError(error)) {
				if (!error.response) {
					res.status(502).render('login.njk', {
						title: 'Login',
						loginError:
							'We could not reach the authentication service. Please try again shortly.',
					});
					return;
				}

				if (error.response?.status === 400) {
					const errors = error.response.data?.errors as
						| BackendValidationError[]
						| undefined;
					const loginError =
						errors?.[0]?.message ?? 'Enter a valid email and password.';

					res.status(400).render('login.njk', {
						title: 'Login',
						loginError,
					});
					return;
				}

				if (error.response?.status === 401) {
					res.status(401).render('login.njk', {
						title: 'Login',
						loginError: 'Email or password did not match our records.',
					});
					return;
				}
			}

			res.status(500).render('login.njk', {
				title: 'Login',
				loginError: 'Internal server error. Please try again.',
			});
		}
	};

	handleLogout = (_req: Request, res: Response): void => {
		clearAuthSession(res);
		res.redirect('/login?loggedOut=1');
	};
}
