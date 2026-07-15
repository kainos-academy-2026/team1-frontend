import type { UserRole } from './userRole.js';

export interface User {
	userId: number;
	email: string;
	role: UserRole;
}
