import axios from 'axios';
import type { NextFunction, Request, Response } from 'express';
import {
	type FieldErrors,
	mapBackendFieldErrors,
} from '../errors/mapBackendFieldErrors.js';
import type { BackendValidationError } from '../models/backendValidation.js';
import type { LoginServiceClient } from '../services/loginService.js';

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

	handleLogin = async (
		req: Request,
		res: Response,
		next: NextFunction,
	): Promise<void> => {
		if (!this.loginService) {
			res.status(503).render('login.njk', {
				title: 'Login',
				loginError: 'Login service is not available yet.',
			});
			return;
		}

		const validationErrors = res.locals.errors as
			| FieldErrors
			| null
			| undefined;

		if (validationErrors && Object.keys(validationErrors).length > 0) {
			res.status(400).render('login.njk', {
				title: 'Login',
				errors: validationErrors,
				formData: {
					email: typeof req.body?.email === 'string' ? req.body.email : '',
				},
			});
			return;
		}

		const { email, password } = req.body as {
			email: string;
			password: string;
		};

		try {
			const { token } = await this.loginService.login({ email, password });
			res.set('Cache-Control', 'no-store');
			res.cookie('token', token, { httpOnly: true });
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
					const mappedFieldErrors = mapBackendFieldErrors(errors);

					res.status(400).render('login.njk', {
						title: 'Login',
						errors: mappedFieldErrors,
						loginError: 'Enter a valid email and password.',
						formData: {
							email,
						},
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

			next(error as Error);
		}
	};
}
