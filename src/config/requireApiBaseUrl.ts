export const requireApiBaseUrl = (): string => {
	if (!process.env.API_BASE_URL) {
		if (process.env.NODE_ENV === 'test') {
			return 'http://localhost:3001';
		}

		throw new Error(
			'API_BASE_URL is required. Set it in your environment before starting the app.',
		);
	}

	return process.env.API_BASE_URL;
};
