import type { JobRole } from '../models/jobRole.js';
import type {
	JobRoleDetailViewModel,
	JobRoleListItemViewModel,
} from '../models/jobRoleViewModel.js';

export const mapJobRoleListItemViewModel = (
	jobRole: JobRole,
	closingDate: string,
): JobRoleListItemViewModel => ({
	jobRoleId: jobRole.jobRoleId,
	roleName: jobRole.roleName,
	location: jobRole.location,
	capabilityName: jobRole.capabilityName,
	bandName: jobRole.bandName,
	closingDate,
});

export const mapJobRoleDetailViewModel = (
	jobRole: JobRole,
	closingDate: string,
): JobRoleDetailViewModel => ({
	...mapJobRoleListItemViewModel(jobRole, closingDate),
	description: jobRole.description,
	responsibilities: jobRole.responsibilities,
	sharepointUrl: jobRole.sharepointUrl,
	status: jobRole.status,
	numberOfOpenPositions: jobRole.numberOfOpenPositions,
});
