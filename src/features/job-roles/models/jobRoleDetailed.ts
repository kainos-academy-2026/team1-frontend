import type { JobRoleStatus } from './jobRoleStatus';

export interface JobRoleDetailed {
	jobRoleId: number;
	name: string;
	description: string;
	responsibilities: string;
	sharepointUrl: string;
	location: string;
	capability: string;
	band: string;
	closingDate: Date;
	status: JobRoleStatus;
	numberOfOpenPositions: number;
}
