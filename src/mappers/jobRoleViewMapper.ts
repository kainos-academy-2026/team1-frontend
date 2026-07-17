import type { JobRole } from '../models/jobRole.js';
import type {
	JobRoleDetailViewModel,
	JobRoleListItemViewModel,
} from '../models/jobRoleViewModel.js';

interface JobRoleViewMapperInput {
	jobRole: JobRole;
	closingDate: string;
}

export class JobRoleViewMapper {
	mapJobRoleListItemViewModel({
		jobRole,
		closingDate,
	}: JobRoleViewMapperInput): JobRoleListItemViewModel {
		return {
			jobRoleId: jobRole.jobRoleId,
			roleName: jobRole.roleName,
			location: jobRole.location,
			capabilityName: jobRole.capabilityName,
			bandName: jobRole.bandName,
			closingDate,
		};
	}

	mapJobRoleDetailViewModel({
		jobRole,
		closingDate,
	}: JobRoleViewMapperInput): JobRoleDetailViewModel {
		return {
			...this.mapJobRoleListItemViewModel({ jobRole, closingDate }),
			description: jobRole.description,
			responsibilities: jobRole.responsibilities,
			sharepointUrl: jobRole.sharepointUrl,
			status: jobRole.status,
			numberOfOpenPositions: jobRole.numberOfOpenPositions,
		};
	}
}
