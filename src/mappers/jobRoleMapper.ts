import type {
	ApiJobRoleDto,
	ApiJobRoleSummaryDto,
} from '../models/apiJobRoleDto.js';
import type { JobRole } from '../models/jobRole.js';
import type { JobRoleStatus } from '../models/jobRoleStatus.js';

export const mapApiJobRoleSummary = (
	jobRole: ApiJobRoleSummaryDto,
): JobRole => {
	return {
		jobRoleId: jobRole.jobRoleId ?? jobRole.id,
		roleName: jobRole.roleName,
		description: jobRole.description,
		responsibilities: jobRole.responsibilities,
		sharepointUrl: jobRole.sharepointUrl ?? jobRole.specification,
		location: jobRole.location,
		capabilityId: jobRole.capabilityId,
		capabilityName: jobRole.capabilityName,
		bandId: jobRole.bandId,
		bandName: jobRole.bandName,
		closingDate: new Date(jobRole.closingDate),
		status: jobRole.status as JobRoleStatus,
		numberOfOpenPositions: jobRole.numberOfOpenPositions,
	};
};

export const mapApiJobRole = (jobRole: ApiJobRoleDto): JobRole => {
	return {
		...mapApiJobRoleSummary(jobRole),
		description: jobRole.description,
		responsibilities: jobRole.responsibilities,
		sharepointUrl: jobRole.sharepointUrl ?? jobRole.specification,
		numberOfOpenPositions: jobRole.numberOfOpenPositions,
	};
};
