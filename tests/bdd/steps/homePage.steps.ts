import { Given, setDefaultTimeout, Then, When } from '@cucumber/cucumber';
import type { Express } from 'express';
import request, { type Response } from 'supertest';
import { expect } from 'vitest';

setDefaultTimeout(30_000);

let response: Response;
let app: Express;

Given('the frontend app is running in test mode', () => {
	process.env.JWT_SECRET = process.env.JWT_SECRET || 'bdd-test-secret';
	process.env.API_BASE_URL =
		process.env.API_BASE_URL || 'http://localhost:3001';
});

When('I request the home page', async () => {
	if (!app) {
		const appModule = await import('../../../src/app.js');
		app = appModule.default;
	}

	response = await request(app).get('/');
});

Then('I should see the careers welcome heading', async () => {
	expect(response.status).toBe(200);
	expect(response.text).toContain('Welcome to Kainos Careers');
});
