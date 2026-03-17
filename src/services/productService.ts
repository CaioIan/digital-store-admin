import { api } from "../lib/api";

export interface ProductCategory {
	id: string; // uuid
	name: string;
	slug: string;
}

export interface ProductImage {
	id?: number;
	path?: string; // from search response
	type?: string; // from create request
	content?: string; // from create request
	enabled?: boolean;
}

export interface ProductOption {
	id?: number;
	title: string;
	values: string[];
	shape?: "square" | "circle" | string;
	radius?: number;
	type?: "text" | "color" | string;
}

export interface Product {
	id: number;
	enabled: boolean;
	name: string;
	slug: string;
	use_in_menu: boolean;
	stock: number;
	description?: string;
	brand?: string;
	gender?: "Masculino" | "Feminino" | "Unisex";
	price: number;
	price_with_discount?: number;
	images: ProductImage[];
	options: ProductOption[];
	categories: ProductCategory[];
	display_order?: number;
}

export interface ProductOrderItem {
	id: number;
	display_order: number;
}

export interface CreateProductPayload {
	enabled?: boolean;
	name: string;
	slug: string;
	use_in_menu?: boolean;
	stock?: number;
	description?: string;
	brand?: string;
	gender?: "Masculino" | "Feminino" | "Unisex";
	price: number;
	price_with_discount?: number;
	category_ids?: string[]; // array de UUIDs
	images?: {
		type: string;
		content: string;
	}[];
	options?: ProductOption[];
}

export const productService = {
	getProducts: async () => {
		const response = await api.get("/v1/product/search", {
			params: { limit: 50 },
		});
		const products = response.data.data as Product[];
		return products.sort(
			(a, b) => (a.display_order ?? Infinity) - (b.display_order ?? Infinity),
		);
	},

	getProductById: async (id: string) => {
		const response = await api.get(`/v1/product/${id}`);
		return response.data as Product;
	},

	createProduct: async (productData: CreateProductPayload) => {
		const response = await api.post("/v1/product", productData);
		return response.data;
	},

	updateProduct: async (
		id: string,
		productData: Partial<CreateProductPayload>,
	) => {
		const response = await api.patch(`/v1/product/${id}`, productData);
		return response.data;
	},

	deleteProduct: async (id: string) => {
		const response = await api.delete(`/v1/product/${id}`);
		return response.data;
	},

	uploadImages: async (formData: FormData) => {
		const response = await api.post("/v1/product/upload-image", formData, {
			headers: {
				"Content-Type": "multipart/form-data",
			},
		});
		return response.data; // Retorna array [{ url: "...", public_id: "..." }]
	},

	updateProductOrder: async (items: ProductOrderItem[]) => {
		const promises = items.map((item) =>
			api.patch(`/v1/product/${item.id}`, {
				display_order: item.display_order,
			}),
		);
		return Promise.all(promises);
	},
};
