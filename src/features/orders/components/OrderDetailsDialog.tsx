import * as Dialog from "@radix-ui/react-dialog";
import { X } from "lucide-react";
import type { Order } from "../types/order";
import { OrderStatusDropdown } from "./OrderStatusDropdown";

interface OrderDetailsDialogProps {
	open: boolean;
	onOpenChange: (open: boolean) => void;
	order: Order | null;
}

export function OrderDetailsDialog({
	open,
	onOpenChange,
	order,
}: OrderDetailsDialogProps) {
	if (!order) return null;

	return (
		<Dialog.Root open={open} onOpenChange={onOpenChange}>
			<Dialog.Portal>
				<Dialog.Overlay className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 transition-all data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0" />
				<Dialog.Content className="fixed left-[50%] top-[50%] z-50 w-full max-w-2xl translate-x-[-50%] translate-y-[-50%] rounded-xl bg-white p-6 shadow-xl transition-all data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0 data-[state=closed]:zoom-out-95 data-[state=open]:zoom-in-95 data-[state=closed]:slide-out-to-left-1/2 data-[state=closed]:slide-out-to-top-[48%] data-[state=open]:slide-in-from-left-1/2 data-[state=open]:slide-in-from-top-[48%] sm:rounded-2xl">
					<div className="flex items-center justify-between mb-6">
						<div>
							<Dialog.Title className="text-xl font-bold text-gray-900">
								Pedido #{order.id.slice(0, 8)}
							</Dialog.Title>
							<p className="text-sm text-gray-500">
								Realizado em{" "}
								{new Date(order.created_at).toLocaleDateString("pt-BR", {
									hour: "2-digit",
									minute: "2-digit",
								})}
							</p>
						</div>
						<div className="flex items-center gap-4">
							<OrderStatusDropdown
								orderId={order.id}
								currentStatus={order.status}
							/>
							<Dialog.Close className="rounded-full p-1.5 text-gray-400 hover:bg-gray-100 hover:text-gray-900 transition-colors">
								<X className="h-5 w-5" />
							</Dialog.Close>
						</div>
					</div>

					<div className="flex flex-col gap-6 max-h-[60vh] overflow-y-auto pr-2">
						<div className="grid grid-cols-1 md:grid-cols-2 gap-6">
							<div className="flex flex-col gap-4">
								<h3 className="font-semibold text-gray-900 flex items-center gap-2">
									Informações do Cliente
								</h3>
								<div className="flex flex-col gap-1.5 text-sm">
									<p className="text-gray-500">
										Nome:{" "}
										<span className="text-gray-900 font-medium">
											{order.client?.name || "N/A"}
										</span>
									</p>
									<p className="text-gray-500">
										Email:{" "}
										<span className="text-gray-900 font-medium">
											{order.client?.email || "N/A"}
										</span>
									</p>
									{order.client?.cpf && (
										<p className="text-gray-500">
											CPF:{" "}
											<span className="text-gray-900 font-medium">
												{order.client.cpf}
											</span>
										</p>
									)}
									{order.client?.phone && (
										<p className="text-gray-500">
											Telefone:{" "}
											<span className="text-gray-900 font-medium">
												{order.client.phone}
											</span>
										</p>
									)}
								</div>
							</div>

							<div className="flex flex-col gap-4">
								<h3 className="font-semibold text-gray-900 flex items-center gap-2">
									Endereço de Entrega
								</h3>
								<div className="flex flex-col gap-1.5 text-sm">
									{order.address ? (
										<>
											<p className="text-gray-500">
												Logradouro:{" "}
												<span className="text-gray-900 font-medium">
													{order.address.street}
												</span>
											</p>
											{order.address.neighborhood && (
												<p className="text-gray-500">
													Bairro:{" "}
													<span className="text-gray-900 font-medium">
														{order.address.neighborhood}
													</span>
												</p>
											)}
											<p className="text-gray-500">
												Cidade:{" "}
												<span className="text-gray-900 font-medium">
													{order.address.city}
												</span>
											</p>
											{order.address.cep && (
												<p className="text-gray-500">
													CEP:{" "}
													<span className="text-gray-900 font-medium">
														{order.address.cep}
													</span>
												</p>
											)}
											{order.address.complement && (
												<p className="text-gray-500">
													Complemento:{" "}
													<span className="text-gray-900 font-medium">
														{order.address.complement}
													</span>
												</p>
											)}
										</>
									) : (
										<p className="text-gray-400 italic">
											Endereço não informado
										</p>
									)}
								</div>
							</div>
						</div>

						<div className="flex flex-col gap-4">
							<h3 className="font-semibold text-gray-900">Itens do Pedido</h3>
							<div className="flex flex-col gap-4">
								{order.items.map((item) => (
									<div
										key={item.product_id}
										className="flex gap-4 items-center"
									>
										<img
											src={item.image_url}
											alt={item.product_name}
											className="h-16 w-16 rounded-lg object-cover bg-gray-50 border border-gray-100"
										/>
										<div className="flex-1 min-w-0">
											<p className="text-sm font-medium text-gray-900 truncate">
												{item.product_name}
											</p>
											<p className="text-xs text-gray-500">
												Qtd: {item.quantity}
											</p>
										</div>
										<div className="text-right">
											<p className="text-sm font-semibold text-gray-900">
												R$ {(item.price_at_purchase * item.quantity).toFixed(2)}
											</p>
											<p className="text-xs text-gray-400">
												Unit: R$ {item.price_at_purchase.toFixed(2)}
											</p>
										</div>
									</div>
								))}
							</div>
						</div>

						<div className="bg-gray-50 rounded-lg p-4 flex justify-between items-center">
							<span className="font-bold text-gray-900">Total do Pedido</span>
							<span className="text-lg font-bold text-primary">
								R$ {order.total.toFixed(2)}
							</span>
						</div>
					</div>

					<div className="mt-8 flex justify-end gap-3">
						<button
							onClick={() => onOpenChange(false)}
							type="button"
							className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 transition-colors"
						>
							Fechar
						</button>
					</div>
				</Dialog.Content>
			</Dialog.Portal>
		</Dialog.Root>
	);
}
