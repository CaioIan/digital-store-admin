import axios from "axios";

// Variável de ambiente pode ser configurada futuramente (.env)
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
			// Poderia emitir um evento ou chamar um dispatch para forçar o logout no frontend
			console.warn("Sessão expirada ou não autenticada");
			// Redirecionamento pode ser gerido no level do Router/Provider
		}
		return Promise.reject(error);
	},
);
