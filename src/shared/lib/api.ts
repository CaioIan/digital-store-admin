import axios from "axios";

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:3000";

export const api = axios.create({
	baseURL: API_URL,
	timeout: 10000,
	withCredentials: true, // Garante que cookies HttpOnly sejam enviados com cada requisição
});

// Interceptor de Resposta
api.interceptors.response.use(
	(response) => response,
	(error) => {
		// Se a API retornar 401, significa que o cookie expirou ou é inválido
		if (error.response?.status === 401) {
			console.warn("Sessão expirada ou não autenticada. Redirecionando para o login...");
			
			// Força o redirecionamento para a página de login
			// Evita loop infinito se já estiver no login
			if (!window.location.pathname.includes("/login")) {
				window.location.href = "/login";
			}
		}
		return Promise.reject(error);
	},
);
