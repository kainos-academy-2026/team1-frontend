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

const toRequiredTextValue = (fieldName: string, value: unknown): string => {
	if (typeof value !== 'string') {
		throw new ValidationError(`Missing required job role field: ${fieldName}`);
	}

	return toRequiredText(fieldName, value);
};

const toSummaryText = (
	fieldName: string,
	value: unknown,
	fallback: string,
): string => {
	if (typeof value !== 'string') {
		return fallback;
	}

	if (value.trim().length === 0) {
		return fallback;
	}

	return value;
};

const toSummarySharepointUrl = (value: unknown): string => {
	if (typeof value !== 'string' || value.trim().length === 0) {
		return 'https://example.com/job-specification';
	}

	try {
		return toSharepointUrl(value);
	} catch {
		return 'https://example.com/job-specification';
	}
};

const toJobRoleId = ({ jobRoleId, id }: ApiJobRoleSummaryDto): number => {
	if (typeof jobRoleId === 'number') {
		return jobRoleId;
	}

	if (typeof id === 'number') {
		return id;
	}

	throw new ValidationError('Missing job role ID.');
};

const toJobRoleStatus = (status: string): JobRoleStatus => {
	const normalizedStatus = status.trim().toLowerCase();

	if (normalizedStatus === JobRoleStatus.Open) return JobRoleStatus.Open;
	if (normalizedStatus === JobRoleStatus.Closed) return JobRoleStatus.Closed;
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
	description: toSummaryText(
		'description',
		jobRole.description,
		'Description not available.',
	),
	responsibilities: toSummaryText(
		'responsibilities',
		jobRole.responsibilities,
		'Responsibilities not available.',
	),
	sharepointUrl: toSummarySharepointUrl(jobRole.sharepointUrl),
	location: toRequiredText('location', jobRole.location),
	capabilityId: jobRole.capabilityId,
	capabilityName: toSummaryText(
		'capabilityName',
		jobRole.capabilityName,
		`Capability ${jobRole.capabilityId}`,
	),
	bandId: jobRole.bandId,
	bandName: toSummaryText(
		'bandName',
		jobRole.bandName,
		`Band ${jobRole.bandId}`,
	),
	closingDate: toClosingDate(jobRole.closingDate),
	status: toJobRoleStatus(jobRole.status),
	numberOfOpenPositions: jobRole.numberOfOpenPositions ?? 0,
});

export const mapApiJobRole = (jobRole: ApiJobRoleDto): JobRole => ({
	...mapApiJobRoleSummary(jobRole),
	description: toSummaryText(
		'description',
		jobRole.description,
		'Description not available.',
	),
	responsibilities: toSummaryText(
		'responsibilities',
		jobRole.responsibilities,
		'Responsibilities not available.',
	),
	sharepointUrl: toSummarySharepointUrl(jobRole.sharepointUrl),
	numberOfOpenPositions: jobRole.numberOfOpenPositions ?? 0,
});
