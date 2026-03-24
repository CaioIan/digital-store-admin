import { zodResolver } from "@hookform/resolvers/zod";
import { LayoutDashboard } from "lucide-react";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { useLocation, useNavigate } from "react-router-dom";
import { toast } from "sonner";
import { z } from "zod";
import { useAuth } from "../../contexts/AuthContext";

const loginSchema = z.object({
	email: z
		.string()
		.min(1, "O e-mail é obrigatório")
		.email("Formato de e-mail inválido"),
	password: z.string().min(1, "A senha é obrigatória"),
});

type LoginFormData = z.infer<typeof loginSchema>;

export function LoginPage() {
	const navigate = useNavigate();
	const location = useLocation();
	const { login } = useAuth();
	const [globalError, setGlobalError] = useState<string | null>(null);

	// Onde o usuário tentava ir, ou default para "/products"
	const from = location.state?.from?.pathname || "/products";

	const {
		register,
		handleSubmit,
		formState: { errors, isSubmitting },
	} = useForm<LoginFormData>({
		resolver: zodResolver(loginSchema),
	});

	const onSubmit = async (data: LoginFormData) => {
		try {
			setGlobalError(null);
			await login(data);
			toast.success("Login bem sucedido!");
			navigate(from, { replace: true });
		} catch (error: any) {
			if (error.response?.status === 400 || error.response?.status === 401) {
				setGlobalError("E-mail ou senha incorretos.");
			} else {
				setGlobalError(
					"Erro ao conectar com o servidor. Tente novamente mais tarde.",
				);
			}
			toast.error("Ocorreu um erro no login.");
		}
	};

	return (
		<div className="flex min-h-screen items-center justify-center bg-gray-50 px-4 py-12 sm:px-6 lg:px-8">
			<div className="w-full max-w-md space-y-8 rounded-xl bg-white p-8 shadow-sm">
				<div className="flex flex-col items-center">
					<div className="w-12 h-12 bg-primary flex items-center justify-center rounded-lg text-white mb-4 shadow-md">
						<LayoutDashboard className="w-6 h-6" />
					</div>
					<h2 className="text-center text-title-medium text-gray-900 leading-tight">
						Painel Administrativo
					</h2>
					<p className="mt-2 text-center text-sm text-gray-500">
						Digital Store V1.0 - Acesso Restrito ao Lojista
					</p>
				</div>

				<form className="mt-8 space-y-6" onSubmit={handleSubmit(onSubmit)}>
					<div className="space-y-4">
						<div className="space-y-2">
							<label
								htmlFor="email"
								className="text-sm font-medium leading-none text-gray-700"
							>
								Endereço de E-mail
							</label>
							<input
								id="email"
								type="email"
								autoComplete="email"
								{...register("email")}
								className="flex h-10 w-full rounded-md border border-gray-300 bg-transparent px-3 py-2 text-sm placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
								placeholder="seu.email@dominio.com.br"
							/>
							{errors.email && (
								<p className="text-xs text-error">{errors.email.message}</p>
							)}
						</div>

						<div className="space-y-2">
							<label
								htmlFor="password"
								className="text-sm font-medium leading-none text-gray-700"
							>
								Senha
							</label>
							<input
								id="password"
								type="password"
								autoComplete="current-password"
								{...register("password")}
								className="flex h-10 w-full rounded-md border border-gray-300 bg-transparent px-3 py-2 text-sm placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
								placeholder="••••••••"
							/>
							{errors.password && (
								<p className="text-xs text-error">{errors.password.message}</p>
							)}
						</div>

						{globalError && (
							<div className="p-3 bg-error/10 border border-error/20 rounded-md">
								<p className="text-sm text-error font-medium">{globalError}</p>
							</div>
						)}
					</div>

					<button
						type="submit"
						disabled={isSubmitting}
						className="flex w-full justify-center rounded-md bg-primary py-2.5 px-4 text-sm font-semibold text-white shadow-sm hover:bg-tertiary focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary disabled:opacity-50 transition-colors"
					>
						{isSubmitting ? "Autenticando..." : "Entrar no Sistema"}
					</button>
				</form>
			</div>
		</div>
	);
}
