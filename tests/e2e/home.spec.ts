import AxeBuilder from '@axe-core/playwright';
import { expect, test } from '@playwright/test';

test.describe('Home page smoke checks', () => {
	test('renders home page content and has no serious accessibility issues', async ({
		page,
	}) => {
		await page.goto('/');

		await expect(
			page.getByRole('heading', { name: 'Welcome to Kainos Careers' }),
		).toBeVisible();

		const accessibilityScan = await new AxeBuilder({ page }).analyze();
		const blockingViolations = accessibilityScan.violations.filter(
			(violation) => {
				return (
					violation.impact === 'critical' || violation.impact === 'serious'
				);
			},
		);

		expect(
			blockingViolations,
			JSON.stringify(blockingViolations, null, 2),
		).toEqual([]);
	});
});
