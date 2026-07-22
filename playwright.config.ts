import { defineConfig } from '@playwright/test';
import { resolveUiBaseUrl } from './tests/config/environment';

const reportDate = new Date().toISOString().slice(0, 10);

export default defineConfig({
	testDir: './tests/e2e',
	timeout: 30_000,
	expect: {
		timeout: 30_000,
	},
	workers: 4,
	retries: 2,
	reporter: [
		['list'],
		[
			'html',
			{
				outputFolder: `test-reports/playwright-html-${reportDate}`,
				open: 'never',
			},
		],
		['json', { outputFile: `test-reports/playwright-${reportDate}.json` }],
	],
	use: {
		baseURL: resolveUiBaseUrl(),
		headless: false,
		navigationTimeout: 60_000,
		trace: 'retain-on-failure',
		screenshot: 'only-on-failure',
	},
	projects: [
		{
			name: 'chromium',
			use: {
				browserName: 'chromium',
			},
		},
		{
			name: 'edge',
			use: {
				browserName: 'chromium',
				channel: 'msedge',
			},
		},
	],
	webServer: {
		command:
			'npm run build && PORT=4000 API_BASE_URL=http://localhost:3001 npm run start',
		url: 'http://localhost:4000',
		reuseExistingServer: true,
		timeout: 120_000,
	},
});
