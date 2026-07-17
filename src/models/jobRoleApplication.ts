import type { ApplicationStatus } from './applicationStatus.js';

export interface JobRoleApplication {
	applicationId: number;
	userId: number;
	userEmail: string;
	status: ApplicationStatus;
	dateApplied: Date;
	cvUrl: string;
}
