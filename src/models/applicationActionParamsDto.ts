import { z } from 'zod';

export const applicationActionParamsSchema = z.object({
	id: z.coerce.number<string>().int().positive(),
	applicationId: z.coerce.number<string>().int().positive(),
});

export type ApplicationActionParamsDto = z.infer<
	typeof applicationActionParamsSchema
>;
