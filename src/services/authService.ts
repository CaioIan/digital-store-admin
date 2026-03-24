import { api } from "../lib/api";

export interface LoginPayload {
	email: string;
	password?: string;
}

export interface UserProfile {
	id: string;
	firstname: string;
	surname: string;
	email: string;
	cpf?: string;
	phone?: string;
}

export const authService = {
	/**
	 * Realiza login enviando credenciais.
	 * A API configura o cookie HttpOnly na resposta.
	 */
	login: async (credentials: LoginPayload): Promise<{ user: UserProfile }> => {
		const response = await api.post("/v1/user/login", credentials);
		return response.data;
	},

	/**
	 * Finaliza sessão requisitando a limpeza do cookie HttpOnly pela API.
	 */
	logout: async (): Promise<void> => {
		await api.post("/v1/user/logout");
	},

	/**
	 * Busca o perfil do usuário logado usando o cookie HttpOnly existente.
	 */
	getProfile: async (): Promise<UserProfile> => {
		const response = await api.get("/v1/user/profile");
		return response.data;
	},
};
