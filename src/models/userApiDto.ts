export interface CreateUserApiRequestDto {
	email: string;
	password: string;
}

export interface CreateUserApiResponseDto {
	userId?: number;
	email: string;
	role: string;
}
