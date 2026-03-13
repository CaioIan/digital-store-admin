import { api } from "../lib/api";
import type { UserListResponse } from "../types/user";

export const userService = {
	getUsers: async (page = 1, limit = 15) => {
		const params = new URLSearchParams({
			page: page.toString(),
			limit: limit.toString(),
		});

		const response = await api.get<UserListResponse>(`/v1/admin/users?${params.toString()}`);
		return response.data;
	},
};
