export interface ApiApplicationDto {
	applicationId: number;
	userId: number;
	userEmail: string;
	status: string;
	dateApplied: string;
	cvPresignedUrl: string;
}
