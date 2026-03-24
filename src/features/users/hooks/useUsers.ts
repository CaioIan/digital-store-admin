import { useQuery } from "@tanstack/react-query";
import { userService } from "../services/userService";

interface UseUsersParams {
	page?: number;
	limit?: number;
	searchQuery?: string;
	roleFilter?: "ALL" | "USER" | "ADMIN";
	initialFilter?: string | null;
}

export function useUsers({
	page = 1,
	limit = 15,
	searchQuery = "",
	roleFilter = "ALL",
	initialFilter = null,
}: UseUsersParams = {}) {
	return useQuery({
		queryKey: ["users", page, limit, searchQuery, roleFilter, initialFilter],
		queryFn: () => userService.getUsers(page, limit),
	});
}