export interface Category {
	id: string;
	name: string;
	slug: string;
	use_in_menu: boolean;
	created_at?: string;
	updated_at?: string;
}

export interface CategorySearchParams {
	limit?: number;
	page?: number;
	fields?: string;
	use_in_menu?: true;
}

export interface CategorySearchResponse {
	data: Category[];
	total: number;
	limit: number;
	page: number;
}

export interface CreateCategoryPayload {
	name: string;
	slug: string;
	use_in_menu?: boolean;
}

export interface UpdateCategoryPayload {
	name: string;
	slug: string;
	use_in_menu: boolean;
}

export interface ApiFieldError {
	field: string;
	message: string;
}
