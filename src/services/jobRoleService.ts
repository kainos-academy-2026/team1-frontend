import type { JobRole } from '../models/jobRole';

export interface JobRoleService {
	getJobRoles(): Promise<JobRole[]>;
	getJobRole(jobRoleId: number): Promise<JobRole | null>;
}
