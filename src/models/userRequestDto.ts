import { z } from 'zod';

export const createUserRequestSchema = z.object({
	email: z
		.string()
		.trim()
		.toLowerCase()
		.email(
			'Please enter a valid email address (for example, name@example.com).',
		),
	password: z
		.string()
		.regex(
			/^(?=.*[a-z])(?=.*[A-Z])(?=.*[^A-Za-z0-9]).{9,}$/,
			'Password must be more than 8 characters and include at least one uppercase letter, one lowercase letter, and one special character.',
		),
});

export type UserRequestDto = z.infer<typeof createUserRequestSchema>;
