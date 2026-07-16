import { describe, expect, it } from 'vitest';
import { ValidationError } from '../src/errors/validationError';
import {
	mapApiJobRole,
	mapApiJobRoleSummary,
} from '../src/mappers/jobRoleMapper';

describe('jobRoleMapper', () => {
	it('returns empty sharepoint URL when summary sharepoint URL is invalid', () => {
		const mapped = mapApiJobRoleSummary({
			id: 8,
			roleName: 'Analyst',
			description: 'Analyse data',
			responsibilities: 'Build reports',
			sharepointUrl: 'javascript:alert(1)',
			location: 'Dublin',
			capabilityId: 1,
			capabilityName: 'Capability',
			bandId: 2,
			bandName: 'Band',
			closingDate: '2026-10-10T00:00:00.000Z',
			status: 'open',
			numberOfOpenPositions: 1,
		});

		expect(mapped.sharepointUrl).toBe('');
	});

	it('returns empty sharepoint URL when summary sharepoint URL is missing', () => {
		const mapped = mapApiJobRoleSummary({
			id: 9,
			roleName: 'Consultant',
			description: 'Advise clients',
			responsibilities: 'Deliver consulting engagements',
			location: 'London',
			capabilityId: 1,
			capabilityName: 'Capability',
			bandId: 2,
			bandName: 'Band',
			closingDate: '2026-10-10T00:00:00.000Z',
			status: 'open',
			numberOfOpenPositions: 1,
		});

		expect(mapped.sharepointUrl).toBe('');
	});

	it('throws when detail sharepoint URL is missing', () => {
		expect(() =>
			mapApiJobRole({
				id: 10,
				roleName: 'Consultant',
				description: 'Advise clients',
				responsibilities: 'Deliver consulting engagements',
				location: 'London',
				capabilityId: 1,
				capabilityName: 'Capability',
				bandId: 2,
				bandName: 'Band',
				closingDate: '2026-10-10T00:00:00.000Z',
				status: 'open',
				numberOfOpenPositions: 1,
			}),
		).toThrowError(
			new ValidationError('Missing required job role field: sharepointUrl'),
		);
	});
});
