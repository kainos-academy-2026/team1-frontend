import type { JobRole } from '../models/jobRole.js';
import type { GetJobRolesPageParams } from './getJobRolesPageParams.js';
import type { GetJobRolesPageResult } from './getJobRolesPageResult.js';

export interface JobRoleService {
	getJobRoles(authToken?: string): Promise<JobRole[]>;
	getJobRolesPage(
		params: GetJobRolesPageParams,
	): Promise<GetJobRolesPageResult>;
	getJobRole(jobRoleId: string, authToken: string): Promise<JobRole | null>;
}
