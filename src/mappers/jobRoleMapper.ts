import type {
	ApiJobRoleDto,
	ApiJobRoleSummaryDto,
} from '../models/apiJobRoleDto.js';
import type { JobRole } from '../models/jobRole.js';
import type { JobRoleStatus } from '../models/jobRoleStatus.js';
import { JobRoleStatus as JobRoleStatusValue } from '../models/jobRoleStatus.js';

export class JobRoleMapper {
	private normaliseStatus(status: string | null): JobRoleStatus | null {
		if (status === null) {
			return null;
		}

		const normalisedStatus = status.toLowerCase();

		if (normalisedStatus === JobRoleStatusValue.Open) {
			return JobRoleStatusValue.Open;
		}

		if (normalisedStatus === JobRoleStatusValue.Closed) {
			return JobRoleStatusValue.Closed;
		}

		return normalisedStatus as JobRoleStatus;
	}

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
			status: this.normaliseStatus(jobRole.status) as JobRoleStatus,
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
