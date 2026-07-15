import axios, { type AxiosInstance } from 'axios';
import { requireApiBaseUrl } from './requireApiBaseUrl.js';

export const createApiHttpClient = (): AxiosInstance => {
	return axios.create({
		baseURL: requireApiBaseUrl(),
	});
};
