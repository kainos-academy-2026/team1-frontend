import type { Request, Response } from 'express';
import type { ZodIssue } from 'zod';
import type { UserRequestDto } from '../models/userRequestDto.js';
import { createUserRequestSchema } from '../models/userRequestDto.js';
import type { UserService } from '../services/userService.js';

interface RegistrationViewModel {
	title: string;
	formData: {
		email: string;
	};
	errors?: Partial<Record<keyof UserRequestDto, string>>;
}

const getSubmittedEmail = (body: unknown): string => {
	if (
		typeof body === 'object' &&
		body !== null &&
		'email' in body &&
		typeof body.email === 'string'
	) {
		return body.email;
	}

	return '';
};

const mapFieldErrors = (
	issues: ZodIssue[],
): Partial<Record<keyof UserRequestDto, string>> => {
	return issues.reduce<Partial<Record<keyof UserRequestDto, string>>>(
		(errors, issue) => {
			const field = issue.path[0];
			if ((field === 'email' || field === 'password') && !errors[field]) {
				errors[field] = issue.message;
			}

			return errors;
		},
		{},
	);
};

const renderRegistrationForm = (
	res: Response,
	viewModel: RegistrationViewModel,
	status = 200,
): void => {
	res.status(status).render('registration.njk', viewModel);
};

export class RegistrationController {
	constructor(private readonly userService: UserService) {}

	getRegistrationForm = (_req: Request, res: Response): void => {
		renderRegistrationForm(res, {
			title: 'Register',
			formData: { email: '' },
		});
	};

	register = async (req: Request, res: Response): Promise<void> => {
		const result = createUserRequestSchema.safeParse(req.body);
		if (!result.success) {
			renderRegistrationForm(
				res,
				{
					title: 'Register',
					formData: { email: getSubmittedEmail(req.body) },
					errors: mapFieldErrors(result.error.issues),
				},
				400,
			);
			return;
		}
		await this.userService.createUser(result.data);
		res.redirect('/');
	};
}
