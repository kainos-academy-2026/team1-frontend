import type {
	ApiJobRoleDto,
	ApiJobRoleSummaryDto,
} from '../models/apiJobRoleDto';
import type { JobRole } from '../models/jobRole';
import { JobRoleStatus } from '../models/jobRoleStatus';

const toJobRoleId = ({ jobRoleId, id }: ApiJobRoleSummaryDto): number => {
	if (typeof jobRoleId === 'number') {
		return jobRoleId;
	}

	if (typeof id === 'number') {
		return id;
	}

	throw new Error('Unexpected job role identifier: undefined');
};

const toJobRoleStatus = (status: string): JobRoleStatus => {
	if (status === JobRoleStatus.Open) return JobRoleStatus.Open;
	if (status === JobRoleStatus.Closed) return JobRoleStatus.Closed;
	throw new Error(`Unexpected job role status: ${status}`);
};

const toClosingDate = (closingDate: string): Date => {
	const parsedClosingDate = new Date(closingDate);
	if (Number.isNaN(parsedClosingDate.getTime())) {
		throw new Error(`Unexpected job role closing date: ${closingDate}`);
	}

	return parsedClosingDate;
};

const toSharepointUrl = (sharepointUrl: string): string => {
	let parsedUrl: URL;
	try {
		parsedUrl = new URL(sharepointUrl);
	} catch {
		throw new Error(`Unexpected job role sharepointUrl: ${sharepointUrl}`);
	}

	if (parsedUrl.protocol !== 'https:') {
		throw new Error(`Unexpected job role sharepointUrl: ${sharepointUrl}`);
	}

	return parsedUrl.toString();
};

export const mapApiJobRoleSummary = (
	jobRole: ApiJobRoleSummaryDto,
): JobRole => ({
	jobRoleId: toJobRoleId(jobRole),
	roleName: jobRole.roleName,
	description: jobRole.description ?? '',
	responsibilities: jobRole.responsibilities ?? '',
	sharepointUrl: jobRole.sharepointUrl ?? '',
	location: jobRole.location,
	capabilityId: jobRole.capabilityId,
	capabilityName:
		jobRole.capabilityName ?? `Capability ${jobRole.capabilityId}`,
	bandId: jobRole.bandId,
	bandName: jobRole.bandName ?? `Band ${jobRole.bandId}`,
	closingDate: toClosingDate(jobRole.closingDate),
	status: toJobRoleStatus(jobRole.status),
	numberOfOpenPositions: jobRole.numberOfOpenPositions ?? 0,
});

export const mapApiJobRole = (jobRole: ApiJobRoleDto): JobRole => ({
	...mapApiJobRoleSummary(jobRole),
	description: jobRole.description,
	responsibilities: jobRole.responsibilities,
	sharepointUrl: toSharepointUrl(jobRole.sharepointUrl),
	numberOfOpenPositions: jobRole.numberOfOpenPositions,
});
