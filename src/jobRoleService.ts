import axios from 'axios';

export interface JobRole {
	id: number;
	name: string;
	location: string;
	capability: string;
	band: string;
	closingDate: string;
	status: string;
}

export const getJobRoles = async (): Promise<JobRole[]> => {
	// The API returns only roles with status 'open'
	const response = await axios.get<JobRole[]>(`${process.env.API_BASE_URL}/job-roles`);
	return response.data;
};
