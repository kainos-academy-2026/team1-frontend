interface ErrorMessage {
	title: string;
	message: string;
}

export const errorMessages = {
	invalidJobRoleId: {
		title: 'Bad request',
		message: 'Invalid job role ID provided.',
	},
	jobRoleNotFound: {
		title: 'Job role not found',
		message: 'The job role you requested could not be found.',
	},
	upstreamDataError: {
		title: 'Upstream data error',
		message: 'The job data received from the upstream API was invalid.',
	},
	upstreamApiError: {
		title: 'Upstream API error',
		message: 'There was a problem contacting the upstream job roles API.',
	},
	internalServerError: {
		title: 'Internal server error',
		message: 'An unexpected error occurred. Please try again.',
	},
} satisfies Record<string, ErrorMessage>;
