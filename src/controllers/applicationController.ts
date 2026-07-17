import axios from 'axios';
import type { Request, Response } from 'express';
import { renderErrorPage } from '../errors/errorPage.js';
import type { JobRoleService } from '../services/jobRoleService.js';

export class ApplicationController {
	constructor(private readonly jobRoleService: JobRoleService) {}

	renderApplyPage = async (req: Request, res: Response): Promise<void> => {
		const jobRoleId = req.params.id as string;
		const token = req.cookies.token as string;

		const jobRole = await this.jobRoleService.getJobRole(jobRoleId, token);
		if (!jobRole) {
			renderErrorPage(res, {
				status: 404,
				title: 'Job role not found',
				message: 'The job role you are trying to apply for does not exist.',
			});
			return;
		}

		if (jobRole.status !== 'open' || jobRole.numberOfOpenPositions <= 0) {
			renderErrorPage(res, {
				status: 409,
				title: 'Role not available',
				message: 'This job role is not currently open for applications.',
			});
			return;
		}

		res.render('apply.njk', {
			title: `Apply - ${jobRole.roleName}`,
			jobRole: {
				jobRoleId: jobRole.jobRoleId,
				roleName: jobRole.roleName,
			},
		});
	};

	handleApply = async (req: Request, res: Response): Promise<void> => {
		const jobRoleId = req.params.id as string;
		const token = req.cookies.token as string;
		const { fileName, contentType } = req.body as {
			fileName: string;
			contentType: string;
		};

		try {
			const result = await this.jobRoleService.applyForJobRole(
				jobRoleId,
				fileName,
				contentType,
				token,
			);

			res.status(200).json(result);
		} catch (error) {
			if (axios.isAxiosError(error)) {
				const status = error.response?.status ?? 500;

				if (status === 404) {
					res.status(404).json({ error: 'Job role not found' });
					return;
				}

				if (status === 409) {
					res.status(409).json({
						error: 'This job role is not open for applications',
					});
					return;
				}

				if (status === 400) {
					res.status(400).json({
						error: error.response?.data?.error ?? 'Invalid application request',
					});
					return;
				}
			}

			res.status(500).json({ error: 'Something went wrong' });
		}
	};
}
