import type { AxiosInstance } from 'axios';
import axios from 'axios';
import type { JobRoleMapper } from '../mappers/jobRoleMapper.js';
import type { ApiApplicationDto } from '../models/apiApplicationDto.js';
import type {
	ApiJobRoleDto,
	ApiJobRoleSummaryDto,
} from '../models/apiJobRoleDto.js';
import type { ApplyJobRoleResponse } from '../models/applyJobRoleResponse.js';
import type { JobRole } from '../models/jobRole.js';
import type { JobRoleApplication } from '../models/jobRoleApplication.js';
import type { GetJobRolesPageParams } from './getJobRolesPageParams.js';
import type { GetJobRolesPageResult } from './getJobRolesPageResult.js';
import type { JobRoleService } from './jobRoleService.js';

interface ApiJobRolesPageDto {
	items: ApiJobRoleSummaryDto[];
	total: number;
}

const isApiJobRolesPageDto = (value: unknown): value is ApiJobRolesPageDto => {
	if (typeof value !== 'object' || value === null) {
		return false;
	}

	const page = value as { items?: unknown; total?: unknown };
	return Array.isArray(page.items) && Number.isFinite(page.total);
};

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

	async getJobRoles(authToken?: string): Promise<JobRole[]> {
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
		const response = await this.httpClient.get<
			ApiJobRoleSummaryDto[] | ApiJobRolesPageDto
		>('/job-roles', {
			params: {
				limit: params.limit,
				offset: params.offset,
			},
			headers: this.authHeaders(params.authToken),
		});

		const apiItems = isApiJobRolesPageDto(response.data)
			? response.data.items
			: response.data;
		const total = isApiJobRolesPageDto(response.data)
			? response.data.total
			: params.offset + apiItems.length;

		const items = apiItems.map((jobRole) =>
			this.jobRoleMapper.mapApiJobRoleSummary(jobRole),
		);

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

	async applyForJobRole(
		jobRoleId: string,
		fileName: string,
		contentType: string,
		authToken: string,
	): Promise<ApplyJobRoleResponse> {
		const response = await this.httpClient.post<ApplyJobRoleResponse>(
			`/job-roles/${jobRoleId}/apply`,
			{ fileName, contentType },
			{ headers: this.authHeaders(authToken) },
		);

		return response.data;
	}

	async getApplicationsForJobRole(
		jobRoleId: string,
		authToken: string,
	): Promise<JobRoleApplication[]> {
		const response = await this.httpClient.get<ApiApplicationDto[]>(
			`/job-roles/${jobRoleId}/applications`,
			{ headers: this.authHeaders(authToken) },
		);

		return response.data.map((application) => ({
			applicationId: application.applicationId,
			userId: application.userId,
			userEmail: application.userEmail,
			status: application.status as JobRoleApplication['status'],
			dateApplied: new Date(application.dateApplied),
			cvUrl: application.cvPresignedUrl,
		}));
	}

	async hireApplicant(
		jobRoleId: string,
		applicationId: string,
		authToken: string,
	): Promise<void> {
		await this.httpClient.patch(
			`/job-roles/${jobRoleId}/applications/${applicationId}/hire`,
			{},
			{ headers: this.authHeaders(authToken) },
		);
	}

	async rejectApplicant(
		jobRoleId: string,
		applicationId: string,
		authToken: string,
	): Promise<void> {
		await this.httpClient.patch(
			`/job-roles/${jobRoleId}/applications/${applicationId}/reject`,
			{},
			{ headers: this.authHeaders(authToken) },
		);
	}
}
