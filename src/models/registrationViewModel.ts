import type { UserRequestDto } from './userRequestDto.js';

export interface RegistrationViewModel {
	title: string;
	formData: {
		email: string;
	};
	errors?: Partial<Record<keyof UserRequestDto, string>>;
}
