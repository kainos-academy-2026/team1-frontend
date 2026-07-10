import type { AxiosInstance } from 'axios';
import axios from 'axios';
import { mapApiJobRole, mapApiJobRoleSummary } from '../mappers/jobRoleMapper';
import type {
	ApiJobRoleDto,
	ApiJobRoleSummaryDto,
} from '../models/apiJobRoleDto';
import type { JobRole } from '../models/jobRole';
import type { JobRoleService } from './jobRoleService';

export interface ApiJobRoleServiceDependencies {
	httpClient?: AxiosInstance;
	apiBaseUrl?: string;
}

export class ApiJobRoleService implements JobRoleService {
	private readonly httpClient: AxiosInstance;
	private readonly apiBaseUrl: string;

	constructor({
		httpClient = axios,
		apiBaseUrl = process.env.API_BASE_URL ?? '',
	}: ApiJobRoleServiceDependencies = {}) {
		this.httpClient = httpClient;
		this.apiBaseUrl = apiBaseUrl;
	}

	async getJobRoles(): Promise<JobRole[]> {
		const response = await this.httpClient.get<ApiJobRoleSummaryDto[]>(
			`${this.apiBaseUrl}/job-roles`,
		);

		return response.data.map(mapApiJobRoleSummary);
	}

	async getJobRole(jobRoleId: number): Promise<JobRole | null> {
		try {
			const response = await this.httpClient.get<ApiJobRoleDto>(
				`${this.apiBaseUrl}/job-roles/${jobRoleId}`,
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
