export interface LoginPayload {
	email: string;
	password: string;
}

export interface UserProfile {
	id: string;
	firstname: string;
	surname: string;
	email: string;
	cpf?: string;
	phone?: string;
}