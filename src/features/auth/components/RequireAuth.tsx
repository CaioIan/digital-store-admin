import type { ReactNode } from "react";
import { Navigate, useLocation } from "react-router-dom";
import { useAuth } from "../hooks/useAuth";

export function RequireAuth({ children }: { children: ReactNode }) {
	const { isAuthenticated, isLoading } = useAuth();
	const location = useLocation();

	if (isLoading) {
		return (
			<div className="flex h-screen w-full items-center justify-center bg-gray-50">
				<div className="flex flex-col items-center space-y-4">
					<div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent"></div>
					<p className="text-gray-500 font-medium">Verificando sessão...</p>
				</div>
			</div>
		);
	}

	if (!isAuthenticated) {
		// Redireciona para login mas salva para onde o user estava tentando ir
		return <Navigate to="/login" state={{ from: location }} replace />;
	}

	return <>{children}</>;
}
