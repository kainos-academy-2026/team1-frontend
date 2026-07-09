import type { AxiosInstance } from 'axios';
import axios from 'axios';
import type { JobRoleService } from './jobRoleService';
import type { JobRole } from './models/jobRole';
import { JobRoleStatus } from './models/jobRoleStatus';

type ApiJobRole = Omit<JobRole, 'closingDate' | 'status'> & {
	closingDate: string;
	status: string;
};

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

	private toStatus(status: string): JobRoleStatus {
		if (status === JobRoleStatus.Open) return JobRoleStatus.Open;
		if (status === JobRoleStatus.Closed) return JobRoleStatus.Closed;
		throw new Error(`Unexpected job role status: ${status}`);
	}

	private toJobRole(jobRole: ApiJobRole): JobRole {
		const closingDate = new Date(jobRole.closingDate);
		if (Number.isNaN(closingDate.getTime())) {
			throw new Error(
				`Unexpected job role closing date: ${jobRole.closingDate}`,
			);
		}

		return {
			...jobRole,
			closingDate,
			status: this.toStatus(jobRole.status),
		};
	}

	async getJobRoles(): Promise<JobRole[]> {
		const response = await this.httpClient.get<ApiJobRole[]>(
			`${this.apiBaseUrl}/job-roles`,
		);

		return response.data.map((jobRole) => this.toJobRole(jobRole));
	}

	async getJobRole(jobRoleId: number): Promise<JobRole | null> {
		try {
			const response = await this.httpClient.get<ApiJobRole>(
				`${this.apiBaseUrl}/job-roles/${jobRoleId}`,
			);

			return this.toJobRole(response.data);
		} catch (error) {
			if (axios.isAxiosError(error) && error.response?.status === 404) {
				return null;
			}

			throw error;
		}
	}
}
