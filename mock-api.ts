import express from 'express';
import type { JobRole } from './src/features/job-roles/models/jobRole';
import { JobRoleStatus } from './src/features/job-roles/models/jobRoleStatus';

const app = express();

app.get('/', (_req, res) => {
	res.json({
		service: 'Mock Job Roles API',
		endpoints: ['/job-roles', '/job-roles/:id'],
	});
});

const jobRoles: JobRole[] = [
	{
		jobRoleId: 1,
		roleName: 'Environmental Sustainability Lead',
		description: 'Lead sustainability initiatives across client programs.',
		responsibilities:
			'Define sustainability strategy, track outcomes, and coach delivery teams.',
		sharepointUrl: 'https://sharepoint.example.com/job-specs/1',
		location: 'Belfast',
		capabilityId: 6,
		bandId: 3,
		closingDate: new Date('2026-09-02'),
		status: JobRoleStatus.Open,
		numberOfOpenPositions: 1,
	},
	{
		jobRoleId: 2,
		roleName: 'Senior Program Manager (Public Sector)',
		description: 'Own delivery of major public sector transformation programs.',
		responsibilities:
			'Manage roadmap, risks, governance, and stakeholder communication.',
		sharepointUrl: 'https://sharepoint.example.com/job-specs/2',
		location: 'Belfast',
		capabilityId: 2,
		bandId: 5,
		closingDate: new Date('2026-08-19'),
		status: JobRoleStatus.Open,
		numberOfOpenPositions: 2,
	},
	{
		jobRoleId: 3,
		roleName: 'Data & AI Capability Lead',
		description:
			'Set direction for data and AI capability growth and delivery.',
		responsibilities:
			'Drive capability strategy, mentor teams, and shape solution quality.',
		sharepointUrl: 'https://sharepoint.example.com/job-specs/3',
		location: 'Belfast',
		capabilityId: 3,
		bandId: 5,
		closingDate: new Date('2026-08-26'),
		status: JobRoleStatus.Open,
		numberOfOpenPositions: 1,
	},
	{
		jobRoleId: 4,
		roleName: 'Senior Business Analyst / Product Consultant (Defence)',
		description: 'Bridge user needs and delivery outcomes in defence projects.',
		responsibilities:
			'Lead discovery, define requirements, and support product decisions.',
		sharepointUrl: 'https://sharepoint.example.com/job-specs/4',
		location: 'Belfast',
		capabilityId: 2,
		bandId: 3,
		closingDate: new Date('2026-08-22'),
		status: JobRoleStatus.Open,
		numberOfOpenPositions: 3,
	},
	{
		jobRoleId: 5,
		roleName: 'Data Architect - Defence',
		description:
			'Design secure and scalable data platforms for defence clients.',
		responsibilities:
			'Define data architecture standards and guide engineering delivery.',
		sharepointUrl: 'https://sharepoint.example.com/job-specs/5',
		location: 'Belfast',
		capabilityId: 3,
		bandId: 4,
		closingDate: new Date('2026-09-05'),
		status: JobRoleStatus.Open,
		numberOfOpenPositions: 1,
	},
	{
		jobRoleId: 6,
		roleName: 'Senior Business Analyst / Product Consultant (Healthcare)',
		description:
			'Support digital healthcare products from discovery to launch.',
		responsibilities:
			'Gather requirements, map workflows, and enable cross-team alignment.',
		sharepointUrl: 'https://sharepoint.example.com/job-specs/6',
		location: 'Belfast',
		capabilityId: 2,
		bandId: 4,
		closingDate: new Date('2026-08-29'),
		status: JobRoleStatus.Open,
		numberOfOpenPositions: 2,
	},
	{
		jobRoleId: 7,
		roleName: 'Senior Palantir Engineer',
		description: 'Build high-value Palantir workflows and data products.',
		responsibilities:
			'Implement integrations, optimise pipelines, and support releases.',
		sharepointUrl: 'https://sharepoint.example.com/job-specs/7',
		location: 'Belfast',
		capabilityId: 3,
		bandId: 3,
		closingDate: new Date('2026-08-18'),
		status: JobRoleStatus.Open,
		numberOfOpenPositions: 2,
	},
	{
		jobRoleId: 8,
		roleName: 'Palantir Services Director',
		description:
			'Lead Palantir service offering and strategic client accounts.',
		responsibilities:
			'Own delivery quality, account growth, and team capability development.',
		sharepointUrl: 'https://sharepoint.example.com/job-specs/8',
		location: 'Belfast',
		capabilityId: 3,
		bandId: 5,
		closingDate: new Date('2026-09-12'),
		status: JobRoleStatus.Open,
		numberOfOpenPositions: 1,
	},
	{
		jobRoleId: 9,
		roleName: 'Principal Data Scientist - Healthcare',
		description: 'Shape advanced analytics and AI outcomes in healthcare.',
		responsibilities:
			'Lead modelling strategy, experimentation, and evidence-based delivery.',
		sharepointUrl: 'https://sharepoint.example.com/job-specs/9',
		location: 'Belfast',
		capabilityId: 3,
		bandId: 5,
		closingDate: new Date('2026-09-16'),
		status: JobRoleStatus.Open,
		numberOfOpenPositions: 1,
	},
	{
		jobRoleId: 10,
		roleName: 'Security Architect',
		description: 'Define secure architecture patterns across cloud platforms.',
		responsibilities:
			'Assess risks, approve designs, and guide secure delivery practices.',
		sharepointUrl: 'https://sharepoint.example.com/job-specs/10',
		location: 'Belfast',
		capabilityId: 4,
		bandId: 4,
		closingDate: new Date('2026-08-24'),
		status: JobRoleStatus.Open,
		numberOfOpenPositions: 2,
	},
	{
		jobRoleId: 11,
		roleName: 'Product Consultant (Defence)',
		description: 'Support product strategy and planning for defence services.',
		responsibilities:
			'Facilitate roadmap decisions and maintain stakeholder alignment.',
		sharepointUrl: 'https://sharepoint.example.com/job-specs/11',
		location: 'Belfast',
		capabilityId: 2,
		bandId: 3,
		closingDate: new Date('2026-08-21'),
		status: JobRoleStatus.Closed,
		numberOfOpenPositions: 0,
	},
];

app.get('/job-roles', (_req, res) => {
	res.json(jobRoles);
});

app.get('/job-roles/:id', (req, res) => {
	const id = Number(req.params.id);
	const role = jobRoles.find((r) => r.jobRoleId === id);
	if (!role) {
		res.status(404).json({ message: 'Job role not found' });
		return;
	}
	res.json(role);
});

app.listen(3000, () => {
	console.log('Mock API running on http://localhost:3000');
});
