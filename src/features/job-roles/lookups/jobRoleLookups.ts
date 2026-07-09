export const capabilityNames: Record<number, string> = {
	1: 'Workday',
	2: 'Product Consulting',
	3: 'Data & AI',
	4: 'Security',
	5: 'Quality Engineering',
	6: 'Business Services Support',
};

export const bandNames: Record<number, string> = {
	1: 'Associate',
	2: 'Senior Associate',
	3: 'Consultant',
	4: 'Manager',
	5: 'Principal',
};

export const getCapabilityName = (capabilityId: number): string =>
	capabilityNames[capabilityId] ?? `Capability ${capabilityId}`;

export const getBandName = (bandId: number): string =>
	bandNames[bandId] ?? `Band ${bandId}`;
