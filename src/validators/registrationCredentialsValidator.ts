import type { UserRequestDto } from '../models/userRequestDto.js';
import { createUserRequestSchema } from '../models/userRequestDto.js';

type RegistrationFieldErrors = {
	email?: string[];
	password?: string[];
};

type ParseRegistrationCredentialsResult =
	| {
			success: true;
			credentials: UserRequestDto;
	  }
	| {
			success: false;
			submittedEmail: string;
			fieldErrors: RegistrationFieldErrors;
	  };

const getSubmittedEmail = (input: unknown): string => {
	if (!input || typeof input !== 'object') {
		return '';
	}

	const body = input as { email?: unknown };
	return typeof body.email === 'string' ? body.email.trim() : '';
};

export const parseRegistrationCredentials = (
	input: unknown,
): ParseRegistrationCredentialsResult => {
	const parsed = createUserRequestSchema.safeParse(input);

	if (!parsed.success) {
		const fieldErrors: RegistrationFieldErrors = {};

		for (const issue of parsed.error.issues) {
			const field = issue.path?.[0];

			if (typeof field !== 'string' || typeof issue.message !== 'string') {
				continue;
			}

			if (field !== 'email' && field !== 'password') {
				continue;
			}

			const existingMessages = fieldErrors[field] ?? [];
			if (!existingMessages.includes(issue.message)) {
				existingMessages.push(issue.message);
			}
			fieldErrors[field] = existingMessages;
		}

		return {
			success: false,
			submittedEmail: getSubmittedEmail(input),
			fieldErrors,
		};
	}

	return {
		success: true,
		credentials: parsed.data,
	};
};

export { createUserRequestSchema as registrationCredentialsSchema };
