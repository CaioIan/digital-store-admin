import { useQuery } from "@tanstack/react-query";
import { ChevronLeft, ChevronRight, Search, X, FilterX } from "lucide-react";
import { useMemo, useState } from "react";
import { userService } from "../services/userService";

const ITEMS_PER_PAGE = 15;
const ALPHABET = "ABCDEFGHIJKLMNOPQRSTUVWXYZ".split("");

const roleBadge: Record<string, { label: string; color: string }> = {
	USER: { label: "Usuário", color: "bg-blue-100 text-blue-800" },
	ADMIN: { label: "Admin", color: "bg-purple-100 text-purple-800" },
};

export function UserListingPage() {
	const [currentPage, setCurrentPage] = useState(1);
	const [searchQuery, setSearchQuery] = useState("");
	const [roleFilter, setRoleFilter] = useState<"ALL" | "USER" | "ADMIN">("ALL");
	const [initialFilter, setInitialFilter] = useState<string | null>(null);

	const {
		data: userResponse,
		isLoading,
		isError,
	} = useQuery({
		queryKey: ["users", currentPage],
		queryFn: () => userService.getUsers(currentPage, ITEMS_PER_PAGE),
	});

	const filteredUsers = useMemo(() => {
		if (!userResponse?.data) return [];

		return userResponse.data.filter((user) => {
			const matchesSearch =
				searchQuery.trim() === "" ||
				`${user.firstname} ${user.surname}`.toLowerCase().includes(searchQuery.toLowerCase()) ||
				user.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
				(user.cpf && user.cpf.includes(searchQuery));

			const matchesRole = roleFilter === "ALL" || user.role === roleFilter;

			const matchesInitial =
				!initialFilter ||
				user.firstname.charAt(0).toUpperCase() === initialFilter;

			return matchesSearch && matchesRole && matchesInitial;
		});
	}, [userResponse?.data, searchQuery, roleFilter, initialFilter]);

	const totalItems = userResponse?.total || 0;
	const totalPages = Math.ceil(totalItems / ITEMS_PER_PAGE);

	const handlePrevPage = () => {
		setCurrentPage((prev) => Math.max(prev - 1, 1));
	};

	const handleNextPage = () => {
		setCurrentPage((prev) => Math.min(prev + 1, totalPages));
	};

	const hasActiveFilters = searchQuery !== "" || roleFilter !== "ALL" || initialFilter !== null;

	const handleClearAllFilters = () => {
		setSearchQuery("");
		setRoleFilter("ALL");
		setInitialFilter(null);
	};

	return (
		<div className="space-y-6">
			<div className="flex items-center justify-between">
				<h1 className="text-xl font-bold text-gray-900">Gerenciamento de Usuários</h1>
			</div>

			{/* Search and Filter Toolbar */}
			<div className="bg-white rounded-lg shadow-sm border border-gray-200 p-5 space-y-4">
				<div className="flex flex-col sm:flex-row gap-3">
					<div className="relative flex-1">
						<Search className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-primary" />
						<input
							type="text"
							placeholder="Pesquisar por nome, email ou CPF..."
							value={searchQuery}
							onChange={(e) => setSearchQuery(e.target.value)}
							className="w-full pl-12 pr-12 py-3 border-2 border-gray-200 rounded-xl text-sm placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary transition-all bg-gray-50 font-medium"
						/>
						{searchQuery && (
							<button
								onClick={() => setSearchQuery("")}
								className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors"
							>
								<X className="h-5 w-5" />
							</button>
						)}
					</div>
					<select
						value={roleFilter}
						onChange={(e) => setRoleFilter(e.target.value as "ALL" | "USER" | "ADMIN")}
						className="px-4 py-3 border-2 border-gray-200 rounded-xl text-sm text-gray-700 bg-gray-50 font-medium focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary transition-all cursor-pointer min-w-[170px]"
					>
						<option value="ALL">Todos os cargos</option>
						<option value="USER">Usuário</option>
						<option value="ADMIN">Admin</option>
					</select>
					{hasActiveFilters && (
						<button
							onClick={handleClearAllFilters}
							className="flex items-center gap-2 px-4 py-3 bg-red-50 text-red-600 border-2 border-red-200 rounded-xl text-sm font-bold hover:bg-red-100 transition-all"
						>
							<FilterX className="w-4 h-4" />
							Limpar
						</button>
					)}
				</div>

				{/* Alphabetical Initial Filter */}
				<div className="flex flex-wrap gap-1.5">
					{ALPHABET.map((letter) => (
						<button
							key={letter}
							onClick={() =>
								setInitialFilter(initialFilter === letter ? null : letter)
							}
							className={`w-9 h-9 flex items-center justify-center rounded-lg text-xs font-bold transition-all ${
								initialFilter === letter
									? "bg-primary text-white shadow-md scale-110"
									: "bg-gray-100 text-gray-600 hover:bg-primary/10 hover:text-primary"
							}`}
						>
							{letter}
						</button>
					))}
				</div>
			</div>

			<div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden flex flex-col">
				{isLoading ? (
					<div className="p-8 text-center text-gray-500">Carregando usuários...</div>
				) : isError ? (
					<div className="p-8 text-center text-red-500">
						Erro ao carregar usuários. Verifique sua conexão com a API.
					</div>
				) : filteredUsers.length === 0 ? (
					<div className="p-8 text-center text-gray-500">
						{hasActiveFilters
							? "Nenhum usuário encontrado para os filtros aplicados."
							: "Nenhum usuário encontrado."}
					</div>
				) : (
					<>
						<div className="overflow-x-auto">
							<table className="w-full text-left text-sm text-gray-700">
								<thead className="bg-gray-50 text-gray-900 border-b border-gray-200 uppercase">
									<tr>
										<th className="px-6 py-4 font-medium">Nome</th>
										<th className="px-6 py-4 font-medium">Email</th>
										<th className="px-6 py-4 font-medium">CPF</th>
										<th className="px-6 py-4 font-medium">Telefone</th>
										<th className="px-6 py-4 font-medium text-center">Cargo</th>
										<th className="px-6 py-4 font-medium">Cadastro</th>
									</tr>
								</thead>
								<tbody className="divide-y divide-gray-200">
									{filteredUsers.map((user) => {
										const badge = roleBadge[user.role] || {
											label: user.role,
											color: "bg-gray-100 text-gray-800",
										};
										return (
											<tr
												key={user.id}
												className="hover:bg-gray-50 transition-colors"
											>
												<td className="px-6 py-4 font-medium text-gray-900">
													{user.firstname} {user.surname}
												</td>
												<td className="px-6 py-4 text-gray-500">
													{user.email}
												</td>
												<td className="px-6 py-4 text-gray-500">
													{user.cpf || "—"}
												</td>
												<td className="px-6 py-4 text-gray-500">
													{user.phone || "—"}
												</td>
												<td className="px-6 py-4 text-center">
													<span
														className={`inline-block px-2.5 py-1 rounded-full text-xs font-semibold ${badge.color}`}
													>
														{badge.label}
													</span>
												</td>
												<td className="px-6 py-4 text-gray-500">
													{new Date(user.created_at).toLocaleDateString(
														"pt-BR",
													)}
												</td>
											</tr>
										);
									})}
								</tbody>
							</table>
						</div>

						{/* Pagination Footer */}
						<div className="px-6 py-5 border-t border-gray-200 bg-white flex flex-col sm:flex-row items-center justify-between gap-4">
							<div className="text-sm text-gray-700 bg-gray-50 px-4 py-2 rounded-full border border-gray-100 shadow-sm">
								Mostrando{" "}
								<span className="text-primary font-bold">
									{filteredUsers.length}
								</span>{" "}
								de{" "}
								<span className="text-gray-900 font-bold">{totalItems}</span>{" "}
								usuários
							</div>

							<div className="flex items-center gap-3">
								<button
									onClick={handlePrevPage}
									disabled={currentPage === 1}
									className="flex items-center gap-2 px-4 py-2 border-2 border-primary text-primary font-bold text-sm rounded-lg hover:bg-primary hover:text-white disabled:opacity-20 disabled:border-gray-300 disabled:text-gray-400 disabled:hover:bg-transparent transition-all"
								>
									<ChevronLeft className="w-4 h-4" />
									Anterior
								</button>

								<div className="flex items-center justify-center min-w-[100px] h-10 rounded-lg bg-gray-50 border border-gray-200 text-sm font-bold text-gray-900 shadow-inner">
									Pág. {currentPage} / {totalPages}
								</div>

								<button
									onClick={handleNextPage}
									disabled={currentPage === totalPages}
									className="flex items-center gap-2 px-4 py-2 bg-primary border-2 border-primary text-white font-bold text-sm rounded-lg hover:bg-tertiary hover:border-tertiary disabled:opacity-20 disabled:bg-gray-300 disabled:border-gray-300 transition-all shadow-md active:scale-95"
								>
									Próximo
									<ChevronRight className="w-4 h-4" />
								</button>
							</div>
						</div>
					</>
				)}
			</div>
		</div>
	);
}
