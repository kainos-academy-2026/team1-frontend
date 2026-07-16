import type { ApplyJobRoleResponse } from '../models/applyJobRoleResponse.js';
import type { JobRole } from '../models/jobRole.js';

export interface JobRoleService {
	getJobRoles(authToken?: string): Promise<JobRole[]>;
	getJobRole(jobRoleId: string, authToken: string): Promise<JobRole | null>;
	applyForJobRole(
		jobRoleId: string,
		fileName: string,
		contentType: string,
		authToken: string,
	): Promise<ApplyJobRoleResponse>;
}
