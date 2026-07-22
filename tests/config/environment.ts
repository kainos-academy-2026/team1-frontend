type EnvironmentName = 'local' | 'dev' | 'staging' | 'qa' | 'test';

const SUPPORTED_ENVIRONMENTS: EnvironmentName[] = [
	'local',
	'dev',
	'staging',
	'qa',
	'test',
];

const asEnvironmentName = (value: string): EnvironmentName => {
	if (!SUPPORTED_ENVIRONMENTS.includes(value as EnvironmentName)) {
		throw new Error(
			`Unsupported TEST_ENV '${value}'. Expected one of: ${SUPPORTED_ENVIRONMENTS.join(', ')}`,
		);
	}

	return value as EnvironmentName;
};

const resolveEnvValue = (
	environment: EnvironmentName,
	prefix: 'UI' | 'API',
	defaultValue?: string,
): string => {
	const key = `${prefix}_${environment.toUpperCase()}_BASE_URL`;
	const configuredValue = process.env[key]?.trim();

	if (configuredValue) {
		return configuredValue;
	}

	if (defaultValue) {
		return defaultValue;
	}

	throw new Error(
		`${key} is required when TEST_ENV=${environment}. Set it in your environment.`,
	);
};

export const resolveTestEnvironment = (): EnvironmentName => {
	const rawEnvironment = process.env.TEST_ENV?.trim() || 'local';
	return asEnvironmentName(rawEnvironment);
};

export const resolveUiBaseUrl = (): string => {
	const environment = resolveTestEnvironment();
	return resolveEnvValue(environment, 'UI', 'http://localhost:4000');
};

export const resolveApiBaseUrl = (): string => {
	const environment = resolveTestEnvironment();
	return resolveEnvValue(environment, 'API', 'http://localhost:3001');
};
