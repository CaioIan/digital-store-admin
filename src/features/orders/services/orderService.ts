import { api } from "../../../shared/lib/api";
import type { OrderListResponse, OrderStatus } from "../types/order";

export const orderService = {
	getOrders: async (page = 1, limit = 10, userId?: string) => {
		const params = new URLSearchParams({
			page: page.toString(),
			limit: limit.toString(),
		});

		if (userId) {
			params.append("userId", userId);
		}

		const response = await api.get<OrderListResponse>(`/v1/admin/orders?${params.toString()}`);
		return response.data;
	},

	updateOrderStatus: async (orderId: string, status: OrderStatus) => {
		const response = await api.patch(`/v1/admin/orders/${orderId}/status`, { status });
		return response.data;
	},
};
