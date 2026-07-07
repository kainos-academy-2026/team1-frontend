import type { JobRole } from './models/jobRole';

export interface JobRoleService {
	getJobRoles(): Promise<JobRole[]>;
}
