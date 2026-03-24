import type { ReactNode } from "react";
import { createContext, useContext, useEffect, useState } from "react";
import type { LoginPayload, UserProfile } from "../services/authService";
import { authService } from "../services/authService";

interface AuthContextType {
	user: UserProfile | null;
	isLoading: boolean;
	login: (credentials: LoginPayload) => Promise<void>;
	logout: () => Promise<void>;
	isAuthenticated: boolean;
	isAdmin: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
	const [user, setUser] = useState<UserProfile | null>(null);
	const [isLoading, setIsLoading] = useState(true);

	// Na inicialização, tentamos buscar o perfil via cookie HttpOnly existente
	useEffect(() => {
		const initAuth = async () => {
			try {
				const profile = await authService.getProfile();
				setUser(profile);
			} catch (error) {
				// Ignora ou loga silenciosamente. 401 significa que não há cookie válido.
				console.debug("Sem sessão ativa.", error);
			} finally {
				setIsLoading(false);
			}
		};

		initAuth();
	}, []);

	const login = async (credentials: LoginPayload) => {
		// Esse passo chama a rota e força o recebimento dos cookies na store local
		const data = await authService.login(credentials);
		setUser(data.user);
	};

	const logout = async () => {
		try {
			await authService.logout();
		} finally {
			// Independe de erro na API limpa na UI
			setUser(null);
		}
	};

	return (
		<AuthContext.Provider
			value={{
				user,
				isLoading,
				login,
				logout,
				isAuthenticated: !!user,
				isAdmin: user?.role === "ADMIN",
			}}
		>
			{children}
		</AuthContext.Provider>
	);
}

export function useAuth() {
	const context = useContext(AuthContext);
	if (context === undefined) {
		throw new Error("useAuth deve ser usado dentro de um AuthProvider");
	}
	return context;
}
