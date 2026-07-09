import type { ApiJobRoleDto } from '../models/apiJobRoleDto';
import type { JobRole } from '../models/jobRole';
import { JobRoleStatus } from '../models/jobRoleStatus';

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

export const mapApiJobRole = (jobRole: ApiJobRoleDto): JobRole => ({
	...jobRole,
	sharepointUrl: toSharepointUrl(jobRole.sharepointUrl),
	closingDate: toClosingDate(jobRole.closingDate),
	status: toJobRoleStatus(jobRole.status),
});
