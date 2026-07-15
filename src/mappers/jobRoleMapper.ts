import { ValidationError } from '../errors/validationError.js';
import type {
	ApiJobRoleDto,
	ApiJobRoleSummaryDto,
} from '../models/apiJobRoleDto.js';
import type { JobRole } from '../models/jobRole.js';
import { JobRoleStatus } from '../models/jobRoleStatus.js';

const toRequiredText = (fieldName: string, value: unknown): string => {
	if (typeof value !== 'string' || value.trim().length === 0) {
		throw new ValidationError(`Missing required job role field: ${fieldName}`);
	}
	return value;
};

const toSummaryText = (
	_fieldName: string,
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

const toRequiredNumber = (fieldName: string, value: unknown): number => {
	if (typeof value !== 'number' || !Number.isFinite(value)) {
		throw new ValidationError(`Missing required job role field: ${fieldName}`);
	}

	return value;
};

const toSummarySharepointUrl = (value: unknown): string => {
	if (typeof value !== 'string' || value.trim().length === 0) {
		throw new ValidationError('Missing required job role field: sharepointUrl');
	}

	return toSharepointUrl(value.trim());
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

const toJobRoleStatus = (status: unknown): JobRoleStatus => {
	if (typeof status !== 'string') {
		throw new ValidationError(`Unexpected job role status: ${String(status)}`);
	}

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
): JobRole => {
	const capabilityId = toRequiredNumber('capabilityId', jobRole.capabilityId);
	const bandId = toRequiredNumber('bandId', jobRole.bandId);

	return {
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
		capabilityId,
		capabilityName: toSummaryText(
			'capabilityName',
			jobRole.capabilityName,
			`Capability ${capabilityId}`,
		),
		bandId,
		bandName: toSummaryText('bandName', jobRole.bandName, `Band ${bandId}`),
		closingDate: toClosingDate(jobRole.closingDate),
		status: toJobRoleStatus(jobRole.status),
		numberOfOpenPositions: jobRole.numberOfOpenPositions ?? 0,
	};
};

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
