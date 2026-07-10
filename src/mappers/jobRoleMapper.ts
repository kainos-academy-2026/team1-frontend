import { ValidationError } from '../errors/validationError';
import type {
	ApiJobRoleDto,
	ApiJobRoleSummaryDto,
} from '../models/apiJobRoleDto';
import type { JobRole } from '../models/jobRole';
import { JobRoleStatus } from '../models/jobRoleStatus';

const toRequiredText = (fieldName: string, value: string): string => {
	if (value.trim().length === 0) {
		throw new ValidationError(`Missing required job role field: ${fieldName}`);
	}

	return value;
};

const toJobRoleId = ({ jobRoleId, id }: ApiJobRoleSummaryDto): number => {
	if (typeof jobRoleId === 'number') {
		return jobRoleId;
	}

	if (typeof id === 'number') {
		return id;
	}

	throw new ValidationError('Unexpected job role identifier: undefined');
};

const toJobRoleStatus = (status: string): JobRoleStatus => {
	if (status === JobRoleStatus.Open) return JobRoleStatus.Open;
	if (status === JobRoleStatus.Closed) return JobRoleStatus.Closed;
	throw new ValidationError(`Unexpected job role status: ${status}`);
};

const toClosingDate = (closingDate: string): Date => {
	const parsedClosingDate = new Date(closingDate);
	if (Number.isNaN(parsedClosingDate.getTime())) {
		throw new ValidationError(
			`Unexpected job role closing date: ${closingDate}`,
		);
	}

	return parsedClosingDate;
};

const toSharepointUrl = (sharepointUrl: string): string => {
	let parsedUrl: URL;
	try {
		parsedUrl = new URL(sharepointUrl);
	} catch {
		throw new ValidationError(`Invalid sharepointUrl format: ${sharepointUrl}`);
	}

	if (parsedUrl.protocol !== 'https:') {
		throw new ValidationError(`sharepointUrl must use HTTPS: ${sharepointUrl}`);
	}

	return parsedUrl.toString();
};

export const mapApiJobRoleSummary = (
	jobRole: ApiJobRoleSummaryDto,
): JobRole => ({
	jobRoleId: toJobRoleId(jobRole),
	roleName: toRequiredText('roleName', jobRole.roleName),
	description: toRequiredText('description', jobRole.description),
	responsibilities: toRequiredText(
		'responsibilities',
		jobRole.responsibilities,
	),
	sharepointUrl: toSharepointUrl(
		toRequiredText('sharepointUrl', jobRole.sharepointUrl),
	),
	location: toRequiredText('location', jobRole.location),
	capabilityId: jobRole.capabilityId,
	capabilityName: toRequiredText('capabilityName', jobRole.capabilityName),
	bandId: jobRole.bandId,
	bandName: toRequiredText('bandName', jobRole.bandName),
	closingDate: toClosingDate(jobRole.closingDate),
	status: toJobRoleStatus(jobRole.status),
	numberOfOpenPositions: jobRole.numberOfOpenPositions,
});

export const mapApiJobRole = (jobRole: ApiJobRoleDto): JobRole => ({
	...mapApiJobRoleSummary(jobRole),
	description: jobRole.description,
	responsibilities: jobRole.responsibilities,
	sharepointUrl: toSharepointUrl(jobRole.sharepointUrl),
	numberOfOpenPositions: jobRole.numberOfOpenPositions,
});
