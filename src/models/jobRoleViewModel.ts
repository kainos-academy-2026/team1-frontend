import type { JobRole } from './jobRole.js';

export interface JobRoleApplicationViewModel {
	applicationId: number;
	username: string;
	status: string;
	cvUrl: string;
	canHire: boolean;
	canReject: boolean;
}

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
	applications: JobRoleApplicationViewModel[];
}
