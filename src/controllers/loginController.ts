import axios from 'axios';
import type { Request, Response } from 'express';
import type { LoginServiceClient } from '../services/loginService';

interface BackendValidationError {
	field: string;
	message: string;
}

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
			res.render('login.njk', {
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

			res.render('login.njk', {
				title: 'Login',
				loginToken: token,
			});
		} catch (error) {
			if (axios.isAxiosError(error)) {
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
}
