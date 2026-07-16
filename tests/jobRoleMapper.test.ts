import { describe, expect, it } from 'vitest';
import {
	mapApiJobRole,
	mapApiJobRoleSummary,
} from '../src/mappers/jobRoleMapper';

describe('jobRoleMapper', () => {
	it('maps summary job role fields from API DTO', () => {
		const mapped = mapApiJobRoleSummary({
			id: 8,
			roleName: 'Analyst',
			description: 'Analyse data',
			responsibilities: 'Build reports',
			sharepointUrl: 'https://example.com/sharepoint',
			location: 'Dublin',
			capabilityId: 1,
			capabilityName: 'Capability',
			bandId: 2,
			bandName: 'Band',
			closingDate: '2026-10-10T00:00:00.000Z',
			status: 'open',
			numberOfOpenPositions: 1,
		});

		expect(mapped.jobRoleId).toBe(8);
		expect(mapped.roleName).toBe('Analyst');
		expect(mapped.sharepointUrl).toBe('https://example.com/sharepoint');
		expect(mapped.numberOfOpenPositions).toBe(1);
	});

	it('maps summary fields as-is when optional fields are missing', () => {
		const mapped = mapApiJobRoleSummary({
			id: 9,
			roleName: 'Consultant',
			location: 'London',
			capabilityId: 1,
			bandId: 2,
			closingDate: '2026-10-10T00:00:00.000Z',
			status: 'open',
		});

		expect(mapped.description).toBeUndefined();
		expect(mapped.responsibilities).toBeUndefined();
		expect(mapped.sharepointUrl).toBeUndefined();
		expect(mapped.capabilityName).toBeUndefined();
		expect(mapped.bandName).toBeUndefined();
		expect(mapped.numberOfOpenPositions).toBeUndefined();
	});

	it('maps detail job role fields from API DTO', () => {
		const mapped = mapApiJobRole({
			id: 10,
			roleName: 'Manager',
			description: 'Manage teams',
			responsibilities: 'Lead delivery',
			sharepointUrl: 'https://example.com/sharepoint',
			location: 'Dublin',
			capabilityId: 1,
			capabilityName: 'Capability',
			bandId: 2,
			bandName: 'Band',
			closingDate: '2026-10-10T00:00:00.000Z',
			status: 'open',
			numberOfOpenPositions: 5,
		});

		expect(mapped.jobRoleId).toBe(10);
		expect(mapped.description).toBe('Manage teams');
		expect(mapped.numberOfOpenPositions).toBe(5);
	});
});
