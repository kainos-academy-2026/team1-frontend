export interface JobRole {
	id: number;
	name: string;
	status: string;
}

export const getJobRoles = async (): Promise<JobRole[]> => {
	// The API returns only roles with status 'open'
	const response = await fetch(`${process.env.API_BASE_URL}/job-roles`);

	if (!response.ok) {
		throw new Error(`Failed to fetch job roles: ${response.status}`);
	}

	return response.json() as Promise<JobRole[]>;
};
