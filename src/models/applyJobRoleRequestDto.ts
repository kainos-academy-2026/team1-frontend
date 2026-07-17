import { z } from 'zod';

export const applyJobRoleRequestSchema = z
	.object({
		fileName: z.string().min(1, 'File name is required'),
		contentType: z.literal(
			'application/pdf',
			'CV must be a PDF (application/pdf)',
		),
	})
	.strict();

export type ApplyJobRoleRequestDto = z.infer<typeof applyJobRoleRequestSchema>;
