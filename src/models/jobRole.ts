import type { JobRoleStatus } from './jobRoleStatus.js';

export interface JobRole {
	jobRoleId: number;
	roleName: string;
	description: string;
	responsibilities: string;
	sharepointUrl: string;
	location: string;
	capabilityId: number;
	capabilityName: string;
	bandId: number;
	bandName: string;
	closingDate: Date;
	status: JobRoleStatus;
	numberOfOpenPositions: number;
}
