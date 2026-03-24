import { api } from "../../../shared/lib/api";
import type { LoginPayload, UserProfile } from "../types/auth";

export const authService = {
	/**
	 * Realiza login enviando credenciais.
	 * A API configura o cookie HttpOnly na resposta.
	 */
	login: async (credentials: LoginPayload): Promise<{ user: UserProfile }> => {
		const response = await api.post("/v1/admin/login", credentials);
		return response.data;
	},

	/**
	 * Finaliza sessão requisitando a limpeza do cookie HttpOnly pela API.
	 */
	logout: async (): Promise<void> => {
		await api.post("/v1/admin/logout");
	},

	/**
	 * Busca o perfil do usuário logado usando o cookie HttpOnly existente.
	 */
	getProfile: async (): Promise<UserProfile> => {
		const response = await api.get("/v1/admin/profile");
		return response.data;
	},
};
