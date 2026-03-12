import { useQuery } from "@tanstack/react-query";
import { Edit2, Trash2 } from "lucide-react";
import { useState } from "react";
import { DeleteProductDialog } from "../../components/products/DeleteProductDialog";
import { productService } from "../../services/productService";

export function ProductListingPage() {
	const [deleteDialogData, setDeleteDialogData] = useState<{
		open: boolean;
		id: number | null;
		name: string | null;
	}>({
		open: false,
		id: null,
		name: null,
	});

	const {
		data: products,
		isLoading,
		isError,
	} = useQuery({
		queryKey: ["products"],
		queryFn: productService.getProducts,
	});

	const handleDeleteClick = (id: number, name: string) => {
		setDeleteDialogData({ open: true, id, name });
	};

	return (
		<div className="space-y-6">
			<div className="flex items-center justify-between">
				<h1 className="text-title-medium text-gray-900">Produtos</h1>
				<button
					onClick={() => {}}
					className="bg-primary text-white hover:bg-tertiary transition-colors px-4 py-2 rounded-md font-medium text-sm opacity-50 cursor-not-allowed"
					disabled
				>
					Adicionar Produto (Em Manutenção)
				</button>
			</div>

			<DeleteProductDialog
				open={deleteDialogData.open}
				onOpenChange={(open) =>
					setDeleteDialogData((prev) => ({ ...prev, open }))
				}
				productId={deleteDialogData.id}
				productName={deleteDialogData.name}
			/>

			<div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
				{isLoading ? (
					<div className="p-8 text-center text-gray-500">
						Carregando produtos...
					</div>
				) : isError ? (
					<div className="p-8 text-center text-error">
						Erro ao carregar a lista de produtos. Verifique sua conexão.
					</div>
				) : !products || products.length === 0 ? (
					<div className="p-8 text-center text-gray-500">
						Nenhum produto cadastrado.
					</div>
				) : (
					<div className="overflow-x-auto">
						<table className="w-full text-left text-sm text-gray-700">
							<thead className="bg-gray-50 text-gray-900 border-b border-gray-200 uppercase">
								<tr>
									<th scope="col" className="px-6 py-4 font-medium">
										Nome do Produto
									</th>
									<th scope="col" className="px-6 py-4 font-medium">
										Preço
									</th>
									<th scope="col" className="px-6 py-4 font-medium">
										Categoria
									</th>
									<th scope="col" className="px-6 py-4 font-medium text-center">
										Estoque
									</th>
									<th scope="col" className="px-6 py-4 font-medium text-center">
										Status
									</th>
									<th scope="col" className="px-6 py-4 font-medium text-right">
										Ações
									</th>
								</tr>
							</thead>
							<tbody className="divide-y divide-gray-200">
								{products.map((product) => (
									<tr
										key={product.id}
										className="hover:bg-gray-50 transition-colors"
									>
										<td className="px-6 py-4 font-medium text-gray-900">
											<div className="flex items-center gap-3">
												{product.images && product.images.length > 0 ? (
													<img
														src={
															product.images[0].path ||
															product.images[0].content
														}
														alt={product.name}
														className="w-10 h-10 rounded object-cover bg-gray-100"
													/>
												) : (
													<div className="w-10 h-10 rounded bg-gray-200 flex items-center justify-center text-gray-400">
														<span className="text-xs">S/I</span>
													</div>
												)}
												<span
													className="truncate max-w-[200px]"
													title={product.name}
												>
													{product.name}
												</span>
											</div>
										</td>
										<td className="px-6 py-4">
											{product.price_with_discount ? (
												<div className="flex flex-col">
													<span className="text-primary font-medium">
														R$ {product.price_with_discount.toFixed(2)}
													</span>
													<span className="text-xs text-gray-400 line-through">
														R$ {product.price.toFixed(2)}
													</span>
												</div>
											) : (
												<span>R$ {product.price.toFixed(2)}</span>
											)}
										</td>
										<td className="px-6 py-4">
											<span className="inline-flex items-center gap-1 rounded-full bg-secondary/20 text-primary px-2.5 py-1 text-xs font-semibold">
												{product.categories && product.categories.length > 0
													? `${product.categories.length} categ.`
													: "Sem categ."}
											</span>
										</td>
										<td className="px-6 py-4 text-center">
											<span className="text-sm font-medium text-gray-700">
												{product.stock || 0}
											</span>
										</td>
										<td className="px-6 py-4 text-center">
											<span
												className={`inline-flex items-center rounded-full px-2.5 py-1 text-xs font-semibold ${
													product.enabled
														? "bg-green-100 text-green-800"
														: "bg-red-100 text-red-800"
												}`}
											>
												{product.enabled ? "Ativo" : "Inativo"}
											</span>
										</td>
										<td className="px-6 py-4 text-right">
											<div className="flex items-center justify-end gap-2">
												<button
													className="text-gray-400 hover:text-primary transition-colors p-1"
													title="Editar"
												>
													<Edit2 className="w-4 h-4" />
												</button>
												<button
													onClick={() =>
														handleDeleteClick(product.id, product.name)
													}
													className="text-gray-400 hover:text-error transition-colors p-1"
													title="Excluir"
												>
													<Trash2 className="w-4 h-4" />
												</button>
											</div>
										</td>
									</tr>
								))}
							</tbody>
						</table>
					</div>
				)}
			</div>
		</div>
	);
}
