import { api } from "../../../shared/lib/api";
import type {
	Category,
	CategorySearchParams,
	CategorySearchResponse,
	CreateCategoryPayload,
	UpdateCategoryPayload,
} from "../types/category";

export const categoryService = {
	getCategories: async (params: CategorySearchParams = {}) => {
		const response = await api.get<CategorySearchResponse>("/v1/category/search", {
			params: {
				limit: params.limit ?? 12,
				page: params.page ?? 1,
				fields: params.fields,
				use_in_menu: params.use_in_menu,
			},
		});

		return response.data;
	},

	getCategoryById: async (id: string) => {
		const response = await api.get<Category>(`/v1/category/${id}`);
		return response.data;
	},

	createCategory: async (payload: CreateCategoryPayload) => {
		const response = await api.post<Category>("/v1/category", payload);
		return response.data;
	},

	updateCategory: async (id: string, payload: UpdateCategoryPayload) => {
		const response = await api.patch<Category>(`/v1/category/${id}`, payload);
		return response.data;
	},

	deleteCategory: async (id: string) => {
		const response = await api.delete<Category>(`/v1/category/${id}`);
		return response.data;
	},
};
