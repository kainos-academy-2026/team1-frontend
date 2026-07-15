import request from 'supertest';
import { describe, expect, it, vi } from 'vitest';

const { getJobRoles, getJobRole } = vi.hoisted(() => ({
	getJobRoles: vi.fn(),
	getJobRole: vi.fn(),
}));

vi.mock('../src/services/apiJobRoleService.js', () => ({
	ApiJobRoleService: class {
		getJobRoles = getJobRoles;
		getJobRole = getJobRole;
	},
}));

import app from '../src/app';

describe('GET /', () => {
	it('renders the home page', async () => {
		const response = await request(app).get('/');

		expect(response.status).toBe(200);
		expect(response.text).toContain('Welcome to Kainos Careers');
	});
});
