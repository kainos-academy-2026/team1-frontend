import type { JobRole } from '../models/jobRole.js';

export interface JobRoleService {
	getJobRoles(): Promise<JobRole[]>;
	getJobRole(jobRoleId: number): Promise<JobRole | null>;
}
