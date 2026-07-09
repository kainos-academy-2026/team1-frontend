import type { Request, Response } from 'express';
import type { JobRoleService } from './jobRoleService';
import { getBandName, getCapabilityName } from './lookups/jobRoleLookups';

export class JobRoleController {
	constructor(private readonly jobRoleService: JobRoleService) {}

	private formatClosingDate(closingDate: Date): string {
		if (Number.isNaN(closingDate.getTime())) {
			return String(closingDate);
		}
		const [year, month, day] = closingDate
			.toISOString()
			.slice(0, 10)
			.split('-');
		return `${day}-${month}-${year}`;
	}

	getJobRoles = async (_req: Request, res: Response): Promise<void> => {
		const jobRoles = (await this.jobRoleService.getJobRoles()).map(
			(jobRole) => ({
				...jobRole,
				capability: getCapabilityName(jobRole.capabilityId),
				band: getBandName(jobRole.bandId),
				closingDate: this.formatClosingDate(jobRole.closingDate),
			}),
		);
		res.render('job-role-list.njk', { jobRoles });
	};

	getJobRole = async (req: Request, res: Response): Promise<void> => {
		const jobRoleId = Number(req.params.id);
		if (!Number.isInteger(jobRoleId) || jobRoleId <= 0) {
			res.status(400).send('Invalid job role id');
			return;
		}

		const jobRole = await this.jobRoleService.getJobRole(jobRoleId);
		if (!jobRole) {
			res.status(404).send('Job role not found');
			return;
		}

		res.render('job-role-information.njk', {
			jobRole: {
				...jobRole,
				capability: getCapabilityName(jobRole.capabilityId),
				band: getBandName(jobRole.bandId),
				closingDate: this.formatClosingDate(jobRole.closingDate),
			},
		});
	};
}
