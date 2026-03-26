import { useQuery } from "@tanstack/react-query";
import { categoryService } from "../services/categoryService";
import type { CategorySearchParams } from "../types/category";

export function useCategories(params: CategorySearchParams = {}) {
	return useQuery({
		queryKey: ["categories", params],
		queryFn: () => categoryService.getCategories(params),
	});
}

export function useCategory(id: string) {
	return useQuery({
		queryKey: ["category", id],
		queryFn: () => categoryService.getCategoryById(id),
		enabled: !!id,
	});
}
