import type { AxiosInstance } from 'axios';
import axios from 'axios';
import type { JobRoleMapper } from '../mappers/jobRoleMapper.js';
import type {
	ApiJobRoleDto,
	ApiJobRoleSummaryDto,
} from '../models/apiJobRoleDto.js';
import type { ApplyJobRoleResponse } from '../models/applyJobRoleResponse.js';
import type { JobRole } from '../models/jobRole.js';
import type { GetJobRolesPageParams } from './getJobRolesPageParams.js';
import type { GetJobRolesPageResult } from './getJobRolesPageResult.js';
import type { JobRoleService } from './jobRoleService.js';

interface ApiJobRolesPageDto {
	items: ApiJobRoleSummaryDto[];
	total: number;
}

const toFiniteNumber = (value: unknown): number | null => {
	if (typeof value === 'number' && Number.isFinite(value)) {
		return value;
	}

	if (typeof value === 'string') {
		const parsed = Number(value);
		if (Number.isFinite(parsed)) {
			return parsed;
		}
	}

	if (Array.isArray(value) && value.length > 0) {
		return toFiniteNumber(value[0]);
	}

	return null;
};
const isApiJobRolesPageDto = (value: unknown): value is ApiJobRolesPageDto => {
	if (typeof value !== 'object' || value === null) {
		return false;
	}

	const page = value as { items?: unknown; total?: unknown };
	return Array.isArray(page.items) && Number.isFinite(page.total);
};

const toApiJobRolesPageDto = (
	data: ApiJobRoleSummaryDto[] | ApiJobRolesPageDto,
	headerTotal: unknown,
	offset: number,
): ApiJobRolesPageDto => {
	if (isApiJobRolesPageDto(data)) {
		return data;
	}

	const parsedTotal = toFiniteNumber(headerTotal);
	return {
		items: data,
		total: parsedTotal ?? offset + data.length,
	};
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
		const apiPage = toApiJobRolesPageDto(
			response.data,
			response.headers?.['x-total-count'],
			params.offset,
		);

		const items = apiPage.items.map((jobRole) =>
			this.jobRoleMapper.mapApiJobRoleSummary(jobRole),
		);
		const total = apiPage.total;

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
}
