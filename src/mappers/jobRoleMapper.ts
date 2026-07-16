import type {
	ApiJobRoleDto,
	ApiJobRoleSummaryDto,
} from '../models/apiJobRoleDto.js';
import type { JobRole } from '../models/jobRole.js';
import type { JobRoleStatus } from '../models/jobRoleStatus.js';

export class JobRoleMapper {
	mapApiJobRoleSummary(jobRole: ApiJobRoleSummaryDto): JobRole {
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
			status: (typeof jobRole.status === 'string'
				? jobRole.status.toLowerCase()
				: jobRole.status) as JobRoleStatus,
			numberOfOpenPositions: jobRole.numberOfOpenPositions,
		};
	}

	mapApiJobRole(jobRole: ApiJobRoleDto): JobRole {
		return {
			...this.mapApiJobRoleSummary(jobRole),
			description: jobRole.description,
			responsibilities: jobRole.responsibilities,
			sharepointUrl: jobRole.sharepointUrl ?? jobRole.specification,
			numberOfOpenPositions: jobRole.numberOfOpenPositions,
		};
	}
}
