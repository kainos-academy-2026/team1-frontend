import type { JobRole } from '../models/jobRole';

export interface JobRoleListItemViewModel {
	jobRoleId: number;
	roleName: string;
	location: string;
	capabilityName: string;
	bandName: string;
	closingDate: string;
}

export interface JobRoleDetailViewModel extends JobRoleListItemViewModel {
	description: string;
	responsibilities: string;
	sharepointUrl: string;
	status: JobRole['status'];
	numberOfOpenPositions: number;
}

const formatClosingDate = (closingDate: Date): string => {
	if (Number.isNaN(closingDate.getTime())) {
		return String(closingDate);
	}

	const [year, month, day] = closingDate.toISOString().slice(0, 10).split('-');
	return `${day}-${month}-${year}`;
};

export const mapJobRoleListItemViewModel = (
	jobRole: JobRole,
): JobRoleListItemViewModel => ({
	jobRoleId: jobRole.jobRoleId,
	roleName: jobRole.roleName,
	location: jobRole.location,
	capabilityName: jobRole.capabilityName,
	bandName: jobRole.bandName,
	closingDate: formatClosingDate(jobRole.closingDate),
});

export const mapJobRoleDetailViewModel = (
	jobRole: JobRole,
): JobRoleDetailViewModel => ({
	...mapJobRoleListItemViewModel(jobRole),
	description: jobRole.description,
	responsibilities: jobRole.responsibilities,
	sharepointUrl: jobRole.sharepointUrl,
	status: jobRole.status,
	numberOfOpenPositions: jobRole.numberOfOpenPositions,
});
