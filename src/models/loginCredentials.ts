import { z } from 'zod';

const loginCredentialsSchema = z.object({
	email: z
		.email()
		.trim()
		.transform((value) => value.toLowerCase()),
	password: z.string().min(1, 'You must enter a password'),
});

export type LoginCredentials = z.infer<typeof loginCredentialsSchema>;

export { loginCredentialsSchema };
