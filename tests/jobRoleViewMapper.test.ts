import { describe, expect, it } from 'vitest';
import { JobRoleViewMapper } from '../src/mappers/jobRoleViewMapper';
import { ApplicationStatus } from '../src/models/applicationStatus';
import { JobRoleStatus } from '../src/models/jobRoleStatus';

const mapper = new JobRoleViewMapper();

const baseJobRole = {
	jobRoleId: 1,
	roleName: 'Engineer',
	description: 'Build things.',
	responsibilities: 'Deliver features.',
	sharepointUrl: 'https://sharepoint.example.com/spec',
	location: 'Belfast',
	capabilityId: 1,
	capabilityName: 'Capability',
	bandId: 2,
	bandName: 'Band',
	closingDate: new Date('2026-08-01T00:00:00.000Z'),
	status: JobRoleStatus.Open,
	numberOfOpenPositions: 1,
};

describe('jobRoleViewMapper', () => {
	it('maps provided closingDate into list view model', () => {
		const mapped = mapper.mapJobRoleListItemViewModel(
			baseJobRole,
			'01-08-2026',
		);

		expect(mapped.closingDate).toBe('01-08-2026');
	});

	it('preserves provided closingDate text as-is in list view model', () => {
		const mapped = mapper.mapJobRoleListItemViewModel(
			baseJobRole,
			'Invalid Date',
		);

		expect(mapped.closingDate).toBe('Invalid Date');
	});

	it('maps list view model fields from a job role', () => {
		const mapped = mapper.mapJobRoleListItemViewModel(
			baseJobRole,
			'01-08-2026',
		);

		expect(mapped).toEqual({
			jobRoleId: 1,
			roleName: 'Engineer',
			location: 'Belfast',
			capabilityName: 'Capability',
			bandName: 'Band',
			closingDate: '01-08-2026',
		});
	});

	it('maps detail view model fields from a job role', () => {
		const mapped = mapper.mapJobRoleDetailViewModel(baseJobRole, '01-08-2026');

		expect(mapped).toEqual({
			jobRoleId: 1,
			roleName: 'Engineer',
			location: 'Belfast',
			capabilityName: 'Capability',
			bandName: 'Band',
			closingDate: '01-08-2026',
			description: 'Build things.',
			responsibilities: 'Deliver features.',
			sharepointUrl: 'https://sharepoint.example.com/spec',
			status: JobRoleStatus.Open,
			numberOfOpenPositions: 1,
			applications: [],
		});
	});

	it('maps application rows with actions for in-progress status', () => {
		const mapped = mapper.mapJobRoleApplicationViewModel({
			applicationId: 10,
			userId: 2,
			userEmail: 'applicant@example.com',
			status: ApplicationStatus.InProgress,
			dateApplied: new Date('2026-07-01T00:00:00.000Z'),
			cvUrl: 'https://s3.example.com/cv',
		});

		expect(mapped).toEqual({
			applicationId: 10,
			username: 'applicant@example.com',
			status: 'in progress',
			cvUrl: 'https://s3.example.com/cv',
			canHire: true,
			canReject: true,
		});
	});

	it('hides actions for non in-progress application statuses', () => {
		const mapped = mapper.mapJobRoleApplicationViewModel({
			applicationId: 10,
			userId: 2,
			userEmail: 'applicant@example.com',
			status: ApplicationStatus.Hired,
			dateApplied: new Date('2026-07-01T00:00:00.000Z'),
			cvUrl: 'https://s3.example.com/cv',
		});

		expect(mapped.canHire).toBe(false);
		expect(mapped.canReject).toBe(false);
		expect(mapped.status).toBe('hired');
	});
});
