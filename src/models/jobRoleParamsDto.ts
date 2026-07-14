import { z } from 'zod';

export const jobRoleParamsSchema = z.object({
	id: z.coerce.number<string>().int().positive(),
});

export type JobRoleParamsDto = z.infer<typeof jobRoleParamsSchema>;
