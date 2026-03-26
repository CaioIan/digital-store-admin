import { useMutation, useQueryClient } from "@tanstack/react-query";
import { Edit2, Plus, Trash2 } from "lucide-react";
import { useMemo, useState } from "react";
import { toast } from "sonner";
import { CategoryFormDialog } from "../components/CategoryFormDialog";
import { DeleteCategoryDialog } from "../components/DeleteCategoryDialog";
import { categoryService } from "../services/categoryService";
import type { Category } from "../types/category";
import type { CategoryFormValues } from "../schemas/CategorySchema";
import { useCategories } from "../hooks/useCategories";

const ITEMS_PER_PAGE = 12;

function getApiErrorMessage(error: unknown) {
	const fallbackMessage = "Não foi possível concluir a operação. Tente novamente.";

	if (
		typeof error === "object" &&
		error !== null &&
		"response" in error &&
		typeof error.response === "object" &&
		error.response !== null &&
		"data" in error.response
	) {
		const responseData = error.response.data as {
			message?: string;
			error?: string;
			errors?: Array<{ message?: string }>;
		};

		if (responseData.errors?.[0]?.message) {
			return responseData.errors[0].message;
		}

		if (responseData.message) {
			return responseData.message;
		}

		if (responseData.error) {
			return responseData.error;
		}
	}

	return fallbackMessage;
}

export function CategoryListingPage() {
	const queryClient = useQueryClient();
	const [currentPage, setCurrentPage] = useState(1);
	const [showOnlyMenuCategories, setShowOnlyMenuCategories] = useState(false);
	const [searchTerm, setSearchTerm] = useState("");
	const [isFormOpen, setIsFormOpen] = useState(false);
	const [selectedCategory, setSelectedCategory] = useState<Category | undefined>();
	const [deleteDialogData, setDeleteDialogData] = useState<{
		open: boolean;
		id: string | null;
		name: string | null;
	}>({
		open: false,
		id: null,
		name: null,
	});

	const { data, isLoading, isError } = useCategories({
		page: currentPage,
		limit: ITEMS_PER_PAGE,
		use_in_menu: showOnlyMenuCategories ? true : undefined,
	});

	const categories = data?.data ?? [];
	const totalItems = data?.total ?? 0;
	const totalPages = Math.max(1, Math.ceil(totalItems / ITEMS_PER_PAGE));

	const filteredCategories = useMemo(() => {
		if (!searchTerm.trim()) {
			return categories;
		}

		const normalizedSearch = searchTerm.toLowerCase();
		return categories.filter(
			(category) =>
				category.name.toLowerCase().includes(normalizedSearch) ||
				category.slug.toLowerCase().includes(normalizedSearch),
		);
	}, [categories, searchTerm]);

	const saveCategoryMutation = useMutation({
		mutationFn: async ({
			formData,
			categoryId,
		}: {
			formData: CategoryFormValues;
			categoryId?: string;
		}) => {
			if (categoryId) {
				return categoryService.updateCategory(categoryId, {
					name: formData.name,
					slug: formData.slug,
					use_in_menu: formData.use_in_menu,
				});
			}

			return categoryService.createCategory({
				name: formData.name,
				slug: formData.slug,
				use_in_menu: formData.use_in_menu,
			});
		},
		onSuccess: (_, variables) => {
			queryClient.invalidateQueries({ queryKey: ["categories"] });
			toast.success(
				variables.categoryId
					? "Categoria atualizada com sucesso!"
					: "Categoria criada com sucesso!",
			);
			setIsFormOpen(false);
			setSelectedCategory(undefined);
		},
		onError: (error) => {
			toast.error(getApiErrorMessage(error));
		},
	});

	const deleteCategoryMutation = useMutation({
		mutationFn: (id: string) => categoryService.deleteCategory(id),
		onSuccess: () => {
			queryClient.invalidateQueries({ queryKey: ["categories"] });
			toast.success("Categoria excluída com sucesso!");
			setDeleteDialogData({ open: false, id: null, name: null });
		},
		onError: (error) => {
			toast.error(getApiErrorMessage(error));
		},
	});

	const handleSubmitForm = async (formData: CategoryFormValues, categoryId?: string) => {
		await saveCategoryMutation.mutateAsync({ formData, categoryId });
	};

	const handleOpenCreateDialog = () => {
		setSelectedCategory(undefined);
		setIsFormOpen(true);
	};

	const handleOpenEditDialog = (category: Category) => {
		setSelectedCategory(category);
		setIsFormOpen(true);
	};

	const handleDeleteCategory = () => {
		if (deleteDialogData.id) {
			deleteCategoryMutation.mutate(deleteDialogData.id);
		}
	};

	const handleToggleMenuFilter = () => {
		setCurrentPage(1);
		setShowOnlyMenuCategories((prev) => !prev);
	};

	const handlePrevPage = () => {
		setCurrentPage((prev) => Math.max(prev - 1, 1));
	};

	const handleNextPage = () => {
		setCurrentPage((prev) => Math.min(prev + 1, totalPages));
	};

	return (
		<div className="space-y-6">
			<div className="flex items-center justify-between gap-4">
				<div>
					<h1 className="text-title-medium text-gray-900">Categorias</h1>
					<p className="text-sm text-gray-500 mt-1">
						Gerencie categorias, controle slug e visibilidade no menu.
					</p>
				</div>
				<button
					type="button"
					onClick={handleOpenCreateDialog}
					className="bg-primary text-white hover:bg-tertiary transition-colors px-4 py-2 rounded-md font-medium text-sm flex items-center gap-2"
				>
					<Plus className="w-4 h-4" />
					Nova Categoria
				</button>
			</div>

			<div className="bg-white border border-gray-200 rounded-lg p-4 flex flex-col md:flex-row md:items-center gap-3">
				<input
					type="text"
					value={searchTerm}
					onChange={(event) => setSearchTerm(event.target.value)}
					placeholder="Buscar por nome ou slug"
					className="w-full md:max-w-sm px-4 py-2.5 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary"
				/>

				<label className="flex items-center gap-2 text-sm text-gray-700 font-medium cursor-pointer">
					<input
						type="checkbox"
						checked={showOnlyMenuCategories}
						onChange={handleToggleMenuFilter}
						className="h-4 w-4 rounded border-gray-300 text-primary focus:ring-primary"
					/>
					Somente categorias no menu
				</label>
			</div>

			<div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
				{isLoading ? (
					<div className="p-8 text-center text-gray-500">Carregando categorias...</div>
				) : isError ? (
					<div className="p-8 text-center text-red-500">
						Erro ao carregar categorias. Verifique sua conexão com a API.
					</div>
				) : filteredCategories.length === 0 ? (
					<div className="p-8 text-center text-gray-500">
						Nenhuma categoria encontrada para os filtros atuais.
					</div>
				) : (
					<>
						<div className="overflow-x-auto">
							<table className="w-full text-left text-sm text-gray-700">
								<thead className="bg-gray-50 text-gray-900 border-b border-gray-200 uppercase">
									<tr>
										<th className="px-6 py-4 font-medium">Nome</th>
										<th className="px-6 py-4 font-medium">Slug</th>
										<th className="px-6 py-4 font-medium text-center">Menu</th>
										<th className="px-6 py-4 font-medium">Atualização</th>
										<th className="px-6 py-4 font-medium text-right">Ações</th>
									</tr>
								</thead>
								<tbody className="divide-y divide-gray-200">
									{filteredCategories.map((category) => (
										<tr key={category.id} className="hover:bg-gray-50 transition-colors">
											<td className="px-6 py-4 font-medium text-gray-900">{category.name}</td>
											<td className="px-6 py-4 text-gray-500">{category.slug}</td>
											<td className="px-6 py-4 text-center">
												<span
													className={`inline-block px-2.5 py-1 rounded-full text-xs font-semibold ${
														category.use_in_menu
															? "bg-emerald-100 text-emerald-700"
															: "bg-gray-100 text-gray-600"
													}`}
												>
													{category.use_in_menu ? "Sim" : "Não"}
												</span>
											</td>
											<td className="px-6 py-4 text-gray-500">
												{category.updated_at
													? new Date(category.updated_at).toLocaleDateString("pt-BR")
													: "-"}
											</td>
											<td className="px-6 py-4">
												<div className="flex items-center justify-end gap-2">
													<button
														type="button"
														onClick={() => handleOpenEditDialog(category)}
														className="border border-gray-300 text-gray-700 hover:bg-gray-50 transition-colors px-3 py-2 rounded-md text-xs font-medium flex items-center gap-2"
													>
														<Edit2 className="w-4 h-4" />
														Editar
													</button>
													<button
														type="button"
														onClick={() =>
															setDeleteDialogData({
																open: true,
																id: category.id,
																name: category.name,
															})
														}
														className="border border-red-200 text-red-600 hover:bg-red-50 transition-colors px-3 py-2 rounded-md text-xs font-medium flex items-center gap-2"
													>
														<Trash2 className="w-4 h-4" />
														Excluir
													</button>
												</div>
											</td>
										</tr>
									))}
								</tbody>
							</table>
						</div>

						<div className="px-6 py-4 border-t border-gray-200 bg-white flex items-center justify-between">
							<p className="text-sm text-gray-600">
								Mostrando <span className="font-semibold">{filteredCategories.length}</span> de{" "}
								<span className="font-semibold">{totalItems}</span> categorias
							</p>

							<div className="flex items-center gap-2">
								<button
									type="button"
									onClick={handlePrevPage}
									disabled={currentPage === 1}
									className="px-3 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 hover:bg-gray-50 disabled:opacity-50"
								>
									Anterior
								</button>
								<span className="text-sm font-medium text-gray-700 px-2">
									Página {currentPage} de {totalPages}
								</span>
								<button
									type="button"
									onClick={handleNextPage}
									disabled={currentPage === totalPages}
									className="px-3 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 hover:bg-gray-50 disabled:opacity-50"
								>
									Próxima
								</button>
							</div>
						</div>
					</>
				)}
			</div>

			<CategoryFormDialog
				open={isFormOpen}
				onOpenChange={setIsFormOpen}
				category={selectedCategory}
				onSubmit={handleSubmitForm}
				isSubmitting={saveCategoryMutation.isPending}
			/>

			<DeleteCategoryDialog
				open={deleteDialogData.open}
				onOpenChange={(open) =>
					setDeleteDialogData((previous) => ({ ...previous, open }))
				}
				categoryName={deleteDialogData.name}
				onConfirm={handleDeleteCategory}
				isDeleting={deleteCategoryMutation.isPending}
			/>
		</div>
	);
}
