import { api } from "../../../shared/lib/api";

export interface Category {
	id: string; // uuid
	name: string;
	slug: string;
	use_in_menu: boolean;
}

export interface CategorySearchResponse {
	data: Category[];
	total: number;
	limit: number;
	page: number;
}

export const categoryService = {
	getCategories: async () => {
		const response = await api.get<CategorySearchResponse>("/v1/category/search", {
			params: { limit: -1 }, // Busca todas
		});
		return response.data.data;
	},
};
