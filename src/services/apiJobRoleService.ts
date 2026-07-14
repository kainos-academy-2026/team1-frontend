import type { AxiosInstance } from 'axios';
import axios from 'axios';
import {
	mapApiJobRole,
	mapApiJobRoleSummary,
} from '../mappers/jobRoleMapper.js';
import type {
	ApiJobRoleDto,
	ApiJobRoleSummaryDto,
} from '../models/apiJobRoleDto.js';
import type { JobRole } from '../models/jobRole.js';
import type { JobRoleService } from './jobRoleService.js';

export class ApiJobRoleService implements JobRoleService {
	constructor(private readonly httpClient: AxiosInstance) {}

	async getJobRoles(): Promise<JobRole[]> {
		const response =
			await this.httpClient.get<ApiJobRoleSummaryDto[]>('/job-roles');

		return response.data.map(mapApiJobRoleSummary);
	}

	async getJobRole(jobRoleId: number): Promise<JobRole | null> {
		try {
			const response = await this.httpClient.get<ApiJobRoleDto>(
				`/job-roles/${jobRoleId}`,
			);

			return mapApiJobRole(response.data);
		} catch (error) {
			if (axios.isAxiosError(error) && error.response?.status === 404) {
				const jobRoles = await this.getJobRoles();
				return (
					jobRoles.find((jobRole) => jobRole.jobRoleId === jobRoleId) ?? null
				);
			}

			throw error;
		}
	}
}
