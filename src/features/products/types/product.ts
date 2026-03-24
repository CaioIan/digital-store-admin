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