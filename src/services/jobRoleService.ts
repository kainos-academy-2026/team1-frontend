import type { JobRole } from '../models/jobRole.js';

export interface JobRoleService {
	getJobRoles(authToken?: string): Promise<JobRole[]>;
	getJobRole(jobRoleId: string, authToken: string): Promise<JobRole | null>;
}
