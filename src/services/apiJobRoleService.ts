import type { AxiosInstance } from 'axios';
import axios from 'axios';
import type { JobRoleMapper } from '../mappers/jobRoleMapper.js';
import type {
	ApiJobRoleDto,
	ApiJobRoleSummaryDto,
} from '../models/apiJobRoleDto.js';
import type { JobRole } from '../models/jobRole.js';
import type { JobRoleService } from './jobRoleService.js';

export class ApiJobRoleService implements JobRoleService {
	constructor(
		private readonly httpClient: AxiosInstance,
		private readonly jobRoleMapper: JobRoleMapper,
	) {}

	private authHeaders(authToken?: string): Record<string, string> {
		if (!authToken || authToken.trim().length === 0) {
			return {};
		}

		return {
			Authorization: `Bearer ${authToken.trim()}`,
		};
	}

	async getJobRoles(authToken: string): Promise<JobRole[]> {
		const response = await this.httpClient.get<ApiJobRoleSummaryDto[]>(
			'/job-roles',
			{ headers: this.authHeaders(authToken) },
		);

		return response.data.map((jobRole) =>
			this.jobRoleMapper.mapApiJobRoleSummary(jobRole),
		);
	}

	async getJobRole(
		jobRoleId: string,
		authToken: string,
	): Promise<JobRole | null> {
		try {
			const response = await this.httpClient.get<ApiJobRoleDto>(
				`/job-roles/${jobRoleId}`,
				{ headers: this.authHeaders(authToken) },
			);

			return this.jobRoleMapper.mapApiJobRole(response.data);
		} catch (error) {
			if (axios.isAxiosError(error) && error.response?.status === 404) {
				const jobRoles = await this.getJobRoles(authToken);
				return (
					jobRoles.find(
						(jobRole) => jobRole.jobRoleId.toString() === jobRoleId,
					) ?? null
				);
			}

			throw error;
		}
	}
}
