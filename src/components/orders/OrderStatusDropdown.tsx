import * as DropdownMenu from "@radix-ui/react-dropdown-menu";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { ChevronDown, Loader2 } from "lucide-react";
import { toast } from "sonner";
import { orderService } from "../../services/orderService";
import type { OrderStatus } from "../../types/order";

interface OrderStatusDropdownProps {
	orderId: string;
	currentStatus: OrderStatus;
}

const statusMap: Record<OrderStatus, { label: string; color: string }> = {
	pending: { label: "Aguardando pagamento", color: "bg-yellow-100 text-yellow-800" },
	completed: { label: "Pagamento Realizado", color: "bg-green-100 text-green-800" },
	shipped: { label: "Pedido enviado", color: "bg-blue-100 text-blue-800" },
	cancelled: { label: "Pedido cancelado", color: "bg-red-100 text-red-800" },
	delivered: { label: "Pedido entregue", color: "bg-gray-100 text-gray-800" },
};

export function OrderStatusDropdown({ orderId, currentStatus }: OrderStatusDropdownProps) {
	const queryClient = useQueryClient();

	const mutation = useMutation({
		mutationFn: (newStatus: OrderStatus) => orderService.updateOrderStatus(orderId, newStatus),
		onSuccess: () => {
			queryClient.invalidateQueries({ queryKey: ["orders"] });
			toast.success("Status atualizado!");
		},
		onError: () => {
			toast.error("Erro ao atualizar status.");
		},
	});

	const { label, color } = statusMap[currentStatus] || {
		label: currentStatus,
		color: "bg-gray-100 text-gray-800",
	};

	return (
		<DropdownMenu.Root>
			<DropdownMenu.Trigger asChild>
				<button
					disabled={mutation.isPending}
					className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-semibold cursor-pointer hover:opacity-80 transition-opacity disabled:opacity-50 ${color}`}
				>
					{mutation.isPending ? (
						<Loader2 className="h-3 w-3 animate-spin" />
					) : (
						<>
							{label}
							<ChevronDown className="h-3 w-3 opacity-50" />
						</>
					)}
				</button>
			</DropdownMenu.Trigger>

			<DropdownMenu.Portal>
				<DropdownMenu.Content
					className="z-50 min-w-[140px] overflow-hidden rounded-md border border-gray-200 bg-white p-1 shadow-md animate-in fade-in-0 zoom-in-95"
					align="center"
				>
					{(Object.keys(statusMap) as OrderStatus[]).map((status) => (
						<DropdownMenu.Item
							key={status}
							onSelect={() => mutation.mutate(status)}
							className={`relative flex cursor-default select-none items-center rounded-sm px-2 py-1.5 text-xs outline-none transition-colors hover:bg-gray-100 hover:text-gray-900 data-[disabled]:pointer-events-none data-[disabled]:opacity-50 ${
								currentStatus === status ? "font-bold bg-gray-50" : ""
							}`}
						>
							{statusMap[status].label}
						</DropdownMenu.Item>
					))}
				</DropdownMenu.Content>
			</DropdownMenu.Portal>
		</DropdownMenu.Root>
	);
}
