import { useQuery } from "@tanstack/react-query";
import { orderService } from "../services/orderService";

interface UseOrdersParams {
	page?: number;
	limit?: number;
	userId?: string;
}

export function useOrders({
	page = 1,
	limit = 10,
	userId,
}: UseOrdersParams = {}) {
	return useQuery({
		queryKey: ["orders", page, limit, userId],
		queryFn: () => orderService.getOrders(page, limit, userId),
	});
}