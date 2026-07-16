import type { AxiosInstance } from 'axios';
import axios from 'axios';
import type { JobRoleMapper } from '../mappers/jobRoleMapper.js';
import type {
	ApiJobRoleDto,
	ApiJobRoleSummaryDto,
} from '../models/apiJobRoleDto.js';
import type { JobRole } from '../models/jobRole.js';
import type { GetJobRolesPageParams } from './getJobRolesPageParams.js';
import type { GetJobRolesPageResult } from './getJobRolesPageResult.js';
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

	async getJobRoles(authToken = ''): Promise<JobRole[]> {
		const response = await this.httpClient.get<ApiJobRoleSummaryDto[]>(
			'/job-roles',
			{ headers: this.authHeaders(authToken) },
		);

		return response.data.map((jobRole) =>
			this.jobRoleMapper.mapApiJobRoleSummary(jobRole),
		);
	}

	async getJobRolesPage(
		params: GetJobRolesPageParams,
	): Promise<GetJobRolesPageResult> {
		const response = await this.httpClient.get<ApiJobRoleSummaryDto[]>(
			'/job-roles',
			{
				params: {
					limit: params.limit,
					offset: params.offset,
				},
				headers: this.authHeaders(params.authToken),
			},
		);

		const items = response.data.map((jobRole) =>
			this.jobRoleMapper.mapApiJobRoleSummary(jobRole),
		);
		const parsedTotal = Number(response.headers?.['x-total-count']);
		const total = Number.isFinite(parsedTotal) ? parsedTotal : items.length;

		return {
			items,
			total,
			limit: params.limit,
			offset: params.offset,
			hasNext: params.offset + params.limit < total,
			hasPrevious: params.offset > 0,
		};
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
