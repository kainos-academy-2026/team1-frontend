import type { AxiosInstance } from 'axios';
import axios from 'axios';
import { mapApiJobRole, mapApiJobRoleSummary } from '../mappers/jobRoleMapper';
import type {
	ApiJobRoleDto,
	ApiJobRoleSummaryDto,
} from '../models/apiJobRoleDto';
import type { JobRole } from '../models/jobRole';
import type { JobRoleService } from './jobRoleService';

export class ApiJobRoleService implements JobRoleService {
	constructor(
		private readonly httpClient: AxiosInstance,
		private readonly apiBaseUrl: string,
	) {}

	private authHeaders(authToken?: string): Record<string, string> {
		if (!authToken || authToken.trim().length === 0) {
			return {};
		}

		return {
			Authorization: `Bearer ${authToken.trim()}`,
		};
	}

	async getJobRoles(authToken?: string): Promise<JobRole[]> {
		const response = await this.httpClient.get<ApiJobRoleSummaryDto[]>(
			`${this.apiBaseUrl}/job-roles`,
			{ headers: this.authHeaders(authToken) },
		);

		return response.data.map(mapApiJobRoleSummary);
	}

	async getJobRole(
		jobRoleId: number,
		authToken: string,
	): Promise<JobRole | null> {
		try {
			const response = await this.httpClient.get<ApiJobRoleDto>(
				`${this.apiBaseUrl}/job-roles/${jobRoleId}`,
				{ headers: this.authHeaders(authToken) },
			);

			return mapApiJobRole(response.data);
		} catch (error) {
			if (axios.isAxiosError(error) && error.response?.status === 404) {
				const jobRoles = await this.getJobRoles(authToken);
				return (
					jobRoles.find((jobRole) => jobRole.jobRoleId === jobRoleId) ?? null
				);
			}

			throw error;
		}
	}
}
