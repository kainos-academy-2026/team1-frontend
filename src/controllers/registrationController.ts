import type { Request, Response } from 'express';
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
	): Promise<void> => {
		await this.userService.createUser(req.body);
		res.redirect('/');
	};
}
