import axios from 'axios';
import type { NextFunction, Request, Response } from 'express';
import {
	type FieldErrors,
	mapBackendFieldErrors,
} from '../errors/mapBackendFieldErrors.js';
import type { BackendValidationError } from '../models/backendValidation.js';
import type { RegistrationViewModel } from '../models/registrationViewModel.js';
import type { UserRequestDto } from '../models/userRequestDto.js';
import type { UserService } from '../services/userService.js';

export class RegistrationController {
	constructor(private readonly userService: UserService) {}

	getRegistrationForm = (_req: Request, res: Response): void => {
		const viewModel: RegistrationViewModel = {
			title: 'Register',
			formData: { email: '' },
		};
		res.render('registration.njk', viewModel);
	};

	register = async (
		req: Request<Record<string, never>, Record<string, never>, UserRequestDto>,
		res: Response,
		next: NextFunction,
	): Promise<void> => {
		const validationErrors = res.locals.errors as
			| FieldErrors
			| null
			| undefined;

		if (validationErrors && Object.keys(validationErrors).length > 0) {
			res.status(400).render('registration.njk', {
				title: 'Register',
				errors: validationErrors,
				formData: {
					email: typeof req.body?.email === 'string' ? req.body.email : '',
				},
			});
			return;
		}

		try {
			await this.userService.createUser(req.body);
			res.redirect('/');
		} catch (error) {
			if (axios.isAxiosError(error)) {
				if (error.response?.status === 400) {
					const errors = error.response.data?.errors as
						| BackendValidationError[]
						| undefined;
					const mappedFieldErrors = mapBackendFieldErrors(errors);

					res.status(400).render('registration.njk', {
						title: 'Register',
						errors: mappedFieldErrors,
						formData: {
							email: typeof req.body?.email === 'string' ? req.body.email : '',
						},
					});
					return;
				}
			}

			next(error as Error);
		}
	};
}
