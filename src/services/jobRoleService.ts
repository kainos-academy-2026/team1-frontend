import type { JobRole } from '../models/jobRole';

export interface JobRoleService {
	getJobRoles(authToken: string): Promise<JobRole[]>;
	getJobRole(jobRoleId: number, authToken: string): Promise<JobRole | null>;
}
