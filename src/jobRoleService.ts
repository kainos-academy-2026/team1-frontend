import type { AxiosInstance } from 'axios';
import axios from 'axios';
import type { JobRole } from './models/jobRole';

export interface JobRoleService {
	getJobRoles(): Promise<JobRole[]>;
}

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
		// The API returns only roles with status 'open'
		const response = await this.httpClient.get<JobRole[]>(
			`${this.apiBaseUrl}/job-roles`,
		);
		return response.data;
	}
}
