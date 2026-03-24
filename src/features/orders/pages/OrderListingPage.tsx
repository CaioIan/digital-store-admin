import { useQuery } from "@tanstack/react-query";
import { Eye, ChevronLeft, ChevronRight } from "lucide-react";
import { useState } from "react";
import { orderService } from "../services/orderService";
import { OrderDetailsDialog } from "../components/OrderDetailsDialog";
import { OrderStatusDropdown } from "../components/OrderStatusDropdown";
import type { Order } from "../types/order";

const ITEMS_PER_PAGE = 10;

export function OrderListingPage() {
	const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
	const [isDetailsOpen, setIsDetailsOpen] = useState(false);
	const [currentPage, setCurrentPage] = useState(1);

	const {
		data: orderResponse,
		isLoading,
		isError,
	} = useQuery({
		queryKey: ["orders", currentPage],
		queryFn: () => orderService.getOrders(currentPage, ITEMS_PER_PAGE),
	});

	const handleViewOrder = (order: Order) => {
		setSelectedOrder(order);
		setIsDetailsOpen(true);
	};

	const totalItems = orderResponse?.total || 0;
	const totalPages = Math.ceil(totalItems / ITEMS_PER_PAGE);

	const handlePrevPage = () => {
		setCurrentPage((prev) => Math.max(prev - 1, 1));
	};

	const handleNextPage = () => {
		setCurrentPage((prev) => Math.min(prev + 1, totalPages));
	};

	return (
		<div className="space-y-6">
			<div className="flex items-center justify-between">
				<h1 className="text-xl font-bold text-gray-900">Gerenciamento de Pedidos</h1>
			</div>

			<OrderDetailsDialog
				open={isDetailsOpen}
				onOpenChange={setIsDetailsOpen}
				order={selectedOrder}
			/>

			<div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden flex flex-col">
				{isLoading ? (
					<div className="p-8 text-center text-gray-500">Carregando pedidos...</div>
				) : isError ? (
					<div className="p-8 text-center text-red-500">
						Erro ao carregar pedidos. Verifique sua conexão com a API.
					</div>
				) : !orderResponse?.data || orderResponse.data.length === 0 ? (
					<div className="p-8 text-center text-gray-500">Nenhum pedido encontrado.</div>
				) : (
					<>
						<div className="overflow-x-auto">
							<table className="w-full text-left text-sm text-gray-700">
								<thead className="bg-gray-50 text-gray-900 border-b border-gray-200 uppercase">
									<tr>
										<th className="px-6 py-4 font-medium">Pedido</th>
										<th className="px-6 py-4 font-medium">Data</th>
										<th className="px-6 py-4 font-medium">Cliente</th>
										<th className="px-6 py-4 font-medium">Valor Total</th>
										<th className="px-6 py-4 font-medium">Itens</th>
										<th className="px-6 py-4 font-medium text-center">Status</th>
										<th className="px-6 py-4 font-medium text-right">Ações</th>
									</tr>
								</thead>
								<tbody className="divide-y divide-gray-200">
									{orderResponse.data.map((order) => (
										<tr key={order.id} className="hover:bg-gray-50 transition-colors">
											<td className="px-6 py-4 font-medium text-gray-900">
												#{order.id.slice(0, 8)}
											</td>
											<td className="px-6 py-4 text-gray-500">
												{new Date(order.created_at).toLocaleDateString("pt-BR")}
											</td>
											<td className="px-6 py-4 text-gray-900">
												{order.client?.name || "N/A"}
											</td>
											<td className="px-6 py-4 font-semibold text-gray-900">
												R$ {order.total.toFixed(2)}
											</td>
											<td className="px-6 py-4 text-gray-500 text-xs">
												{order.items.length === 1
													? order.items[0].product_name
													: `${order.items[0].product_name} + ${order.items.length - 1} itens`}
											</td>
											<td className="px-6 py-4 text-center">
												<OrderStatusDropdown
													orderId={order.id}
													currentStatus={order.status}
												/>
											</td>
											<td className="px-6 py-4 text-right">
												<div className="flex items-center justify-end gap-2">
													<button
														onClick={() => handleViewOrder(order)}
														className="text-gray-400 hover:text-primary transition-colors p-1"
														title="Ver Detalhes"
													>
														<Eye className="w-4 h-4" />
													</button>
												</div>
											</td>
										</tr>
									))}
								</tbody>
							</table>
						</div>

						{/* Pagination Footer */}
						<div className="px-6 py-5 border-t border-gray-200 bg-white flex flex-col sm:flex-row items-center justify-between gap-4">
							<div className="text-sm text-gray-700 bg-gray-50 px-4 py-2 rounded-full border border-gray-100 shadow-sm">
								Mostrando{" "}
								<span className="text-primary font-bold">
									{(currentPage - 1) * ITEMS_PER_PAGE + 1}
								</span>{" "}
								até <span className="text-primary font-bold">
									{Math.min(currentPage * ITEMS_PER_PAGE, totalItems)}
								</span>{" "}
								de <span className="text-gray-900 font-bold">{totalItems}</span> pedidos
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
