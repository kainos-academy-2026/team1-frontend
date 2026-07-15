export interface ApiJobRoleSummaryDto {
	jobRoleId: number;
	id: number;
	roleName: string;
	description: string;
	responsibilities: string;
	sharepointUrl: string;
	specification: string;
	location: string;
	capabilityId: number;
	capabilityName: string;
	bandId: number;
	bandName: string;
	closingDate: string;
	status: string;
	numberOfOpenPositions: number;
}

export interface ApiJobRoleDto extends ApiJobRoleSummaryDto {
	jobRoleId: number;
	description: string;
	responsibilities: string;
	sharepointUrl: string;
	specification: string;
	capabilityName: string;
	bandName: string;
	numberOfOpenPositions: number;
}
