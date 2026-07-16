import { describe, expect, it } from 'vitest';
import {
	mapJobRoleDetailViewModel,
	mapJobRoleListItemViewModel,
} from '../src/mappers/jobRoleViewMapper';
import { JobRoleStatus } from '../src/models/jobRoleStatus';

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
	it('formats a valid closing date as DD-MM-YYYY in the list view model', () => {
		const mapped = mapJobRoleListItemViewModel(baseJobRole);

		expect(mapped.closingDate).toBe('01-08-2026');
	});

	it('preserves invalid date text in list view model formatting fallback', () => {
		const mapped = mapJobRoleListItemViewModel({
			...baseJobRole,
			closingDate: new Date('invalid date'),
		});

		expect(mapped.closingDate).toBe('Invalid Date');
	});

	it('maps list view model fields from a job role', () => {
		const mapped = mapJobRoleListItemViewModel(baseJobRole);

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
		const mapped = mapJobRoleDetailViewModel(baseJobRole);

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
		});
	});
});
