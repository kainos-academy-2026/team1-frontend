import express from 'express';

const app = express();

app.get('/job-roles', (_req, res) => {
	res.json([
		{
			id: 1,
			name: 'D365 Solution Architect',
			location: 'Belfast',
			capability: 'Workday',
			band: 'Lead',
			closingDate: '2026-07-28',
			status: 'open',
		},
		{
			id: 2,
			name: 'Senior Platform Engineer - AWS',
			location: 'Birmingham',
			capability: 'Cloud Services',
			band: 'Lead',
			closingDate: '2026-07-21',
			status: 'open',
		},
		{
			id: 3,
			name: 'Data & AI Capability Lead',
			location: 'Homeworker - UK',
			capability: 'Data & AI',
			band: 'Principal',
			closingDate: '2026-08-04',
			status: 'open',
		},
		{
			id: 4,
			name: 'Cloud Security Engineer',
			location: 'Belfast',
			capability: 'Security',
			band: 'Senior',
			closingDate: '2026-07-30',
			status: 'open',
		},
		{
			id: 5,
			name: 'Senior Security Architect',
			location: 'Homeworker - UK',
			capability: 'Security',
			band: 'Principal',
			closingDate: '2026-08-11',
			status: 'open',
		},
		{
			id: 6,
			name: 'Lead Test Engineer',
			location: 'Birmingham',
			capability: 'Quality Assurance',
			band: 'Lead',
			closingDate: '2026-07-25',
			status: 'open',
		},
		{
			id: 7,
			name: 'Workday Extend Developer',
			location: 'Hyderabad',
			capability: 'Workday',
			band: 'Senior',
			closingDate: '2026-08-07',
			status: 'open',
		},
	]);
});

app.listen(3000, () => {
	console.log('Mock API running on http://localhost:3000');
});
