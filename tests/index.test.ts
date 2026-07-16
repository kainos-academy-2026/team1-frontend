import request from 'supertest';
import { afterEach, beforeEach, describe, expect, it } from 'vitest';

import app from '../src/app';
import { createAuthToken, withTestJwtSecret } from './helpers/authToken';

describe('GET /', () => {
	let restoreJwtSecret: () => void;

	beforeEach(() => {
		restoreJwtSecret = withTestJwtSecret();
	});

	afterEach(() => {
		restoreJwtSecret();
	});

	it('renders the home page for anonymous users', async () => {
		const response = await request(app).get('/');

		expect(response.status).toBe(200);
		expect(response.text).toContain('Welcome to Kainos Careers');
		expect(response.text).toContain('href="/auth/login">View applications</a>');
	});

	it('renders the home page for authenticated users', async () => {
		const response = await request(app)
			.get('/')
			.set('Cookie', [`token=${createAuthToken()}`]);

		expect(response.status).toBe(200);
		expect(response.text).toContain('Welcome to Kainos Careers');
		expect(response.text).toContain('href="/auth/login">View applications</a>');
	});
});
