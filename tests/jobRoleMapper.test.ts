import { describe, expect, it } from 'vitest';
import { JobRoleMapper } from '../src/mappers/jobRoleMapper';

const mapper = new JobRoleMapper();

describe('jobRoleMapper', () => {
	it('maps summary job role fields from API DTO', () => {
		const mapped = mapper.mapApiJobRoleSummary({
			id: 8,
			jobRoleId: 8,
			roleName: 'Analyst',
			description: 'Analyse data',
			responsibilities: 'Build reports',
			sharepointUrl: 'https://example.com/sharepoint',
			specification: 'https://example.com/specification',
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

	it('maps summary fields as-is', () => {
		const mapped = mapper.mapApiJobRoleSummary({
			id: 9,
			jobRoleId: 9,
			roleName: 'Consultant',
			description: '',
			responsibilities: '',
			sharepointUrl: '',
			specification: '',
			location: 'London',
			capabilityId: 1,
			capabilityName: '',
			bandId: 2,
			bandName: '',
			closingDate: '2026-10-10T00:00:00.000Z',
			status: 'open',
			numberOfOpenPositions: 0,
		});

		expect(mapped.description).toBe('');
		expect(mapped.responsibilities).toBe('');
		expect(mapped.sharepointUrl).toBe('');
		expect(mapped.capabilityName).toBe('');
		expect(mapped.bandName).toBe('');
		expect(mapped.numberOfOpenPositions).toBe(0);
	});

	it('maps detail job role fields from API DTO', () => {
		const mapped = mapper.mapApiJobRole({
			id: 10,
			jobRoleId: 10,
			roleName: 'Manager',
			description: 'Manage teams',
			responsibilities: 'Lead delivery',
			sharepointUrl: 'https://example.com/sharepoint',
			specification: 'https://example.com/specification',
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

	it('normalises uppercase status values to lowercase', () => {
		const mapped = mapper.mapApiJobRoleSummary({
			id: 11,
			jobRoleId: 11,
			roleName: 'Engineer',
			description: 'Build software',
			responsibilities: 'Write code',
			sharepointUrl: 'https://example.com/spec',
			specification: 'https://example.com/spec',
			location: 'Belfast',
			capabilityId: 1,
			capabilityName: 'Engineering',
			bandId: 2,
			bandName: 'Senior',
			closingDate: '2026-08-01',
			status: 'OPEN',
			numberOfOpenPositions: 3,
		});

		expect(mapped.status).toBe('open');
	});

	it('normalises uppercase CLOSED status to lowercase', () => {
		const mapped = mapper.mapApiJobRoleSummary({
			id: 12,
			jobRoleId: 12,
			roleName: 'Analyst',
			description: 'Analyse',
			responsibilities: 'Report',
			sharepointUrl: 'https://example.com/spec',
			specification: 'https://example.com/spec',
			location: 'Dublin',
			capabilityId: 1,
			capabilityName: 'Data',
			bandId: 3,
			bandName: 'Consultant',
			closingDate: '2026-08-01',
			status: 'CLOSED',
			numberOfOpenPositions: 0,
		});

		expect(mapped.status).toBe('closed');
	});
});
