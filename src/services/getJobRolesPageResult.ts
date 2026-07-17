import type { JobRole } from '../models/jobRole.js';

export interface GetJobRolesPageResult {
	items: JobRole[];
	total: number;
	limit: number;
	offset: number;
	hasNext: boolean;
	hasPrevious: boolean;
}
