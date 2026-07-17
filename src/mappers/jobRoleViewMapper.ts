import { ApplicationStatus } from '../models/applicationStatus.js';
import type { JobRole } from '../models/jobRole.js';
import type { JobRoleApplication } from '../models/jobRoleApplication.js';
import type {
	JobRoleApplicationViewModel,
	JobRoleDetailViewModel,
	JobRoleListItemViewModel,
} from '../models/jobRoleViewModel.js';

export class JobRoleViewMapper {
	private toApplicationStatusLabel(
		status: JobRoleApplication['status'],
	): string {
		if (status === ApplicationStatus.InProgress) {
			return 'in progress';
		}

		if (status === ApplicationStatus.Hired) {
			return 'hired';
		}

		if (status === ApplicationStatus.Rejected) {
			return 'rejected';
		}

		return String(status).replaceAll('_', ' ').toLowerCase();
	}

	mapJobRoleApplicationViewModel(
		application: JobRoleApplication,
	): JobRoleApplicationViewModel {
		const inProgress = application.status === ApplicationStatus.InProgress;

		return {
			applicationId: application.applicationId,
			username: application.userEmail,
			status: this.toApplicationStatusLabel(application.status),
			cvUrl: application.cvUrl,
			canHire: inProgress,
			canReject: inProgress,
		};
	}

	mapJobRoleListItemViewModel(
		jobRole: JobRole,
		closingDate: string,
	): JobRoleListItemViewModel {
		return {
			jobRoleId: jobRole.jobRoleId,
			roleName: jobRole.roleName,
			location: jobRole.location,
			capabilityName: jobRole.capabilityName,
			bandName: jobRole.bandName,
			closingDate,
		};
	}

	mapJobRoleDetailViewModel(
		jobRole: JobRole,
		closingDate: string,
		applications: JobRoleApplicationViewModel[] = [],
	): JobRoleDetailViewModel {
		return {
			...this.mapJobRoleListItemViewModel(jobRole, closingDate),
			description: jobRole.description,
			responsibilities: jobRole.responsibilities,
			sharepointUrl: jobRole.sharepointUrl,
			status: jobRole.status,
			numberOfOpenPositions: jobRole.numberOfOpenPositions,
			applications,
		};
	}
}
