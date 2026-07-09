import type { AxiosInstance } from 'axios';
import axios from 'axios';
import type { JobRoleService } from './jobRoleService';
import { mapApiJobRole } from './mappers/jobRoleMapper';
import type { ApiJobRoleDto } from './models/apiJobRoleDto';
import type { JobRole } from './models/jobRole';

export interface ApiJobRoleServiceDependencies {
	httpClient?: AxiosInstance;
	apiBaseUrl?: string;
}

export class ApiJobRoleService implements JobRoleService {
	private readonly httpClient: AxiosInstance;
	private readonly apiBaseUrl: string;

	constructor({
		httpClient = axios,
		apiBaseUrl = process.env.API_BASE_URL,
	}: ApiJobRoleServiceDependencies = {}) {
		if (!apiBaseUrl) {
			throw new Error('API_BASE_URL is not configured');
		}

		this.httpClient = httpClient;
		this.apiBaseUrl = apiBaseUrl;
	}
	async getJobRoles(): Promise<JobRole[]> {
		const response = await this.httpClient.get<ApiJobRoleDto[]>(
			`${this.apiBaseUrl}/job-roles`,
		);

		return response.data.map(mapApiJobRole);
	}

	async getJobRole(jobRoleId: number): Promise<JobRole | null> {
		try {
			const response = await this.httpClient.get<ApiJobRoleDto>(
				`${this.apiBaseUrl}/job-roles/${jobRoleId}`,
			);

			return mapApiJobRole(response.data);
		} catch (error) {
			if (axios.isAxiosError(error) && error.response?.status === 404) {
				return null;
			}

			throw error;
		}
	}
}
