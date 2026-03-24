import { useQuery } from "@tanstack/react-query";
import { productService } from "../services/productService";

export function useProducts() {
	return useQuery({
		queryKey: ["products"],
		queryFn: productService.getProducts,
	});
}

export function useProduct(id: string) {
	return useQuery({
		queryKey: ["product", id],
		queryFn: () => productService.getProductById(id),
		enabled: !!id,
	});
}