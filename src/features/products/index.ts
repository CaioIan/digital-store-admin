// Pages
export { ProductListingPage } from './pages/ProductListingPage';
export { ProductEditPage } from './pages/ProductEditPage';

// Components
export { ProductFormDialog } from './components/ProductFormDialog';
export { DeleteProductDialog } from './components/DeleteProductDialog';
export { ProductOrderManager } from './components/ProductOrderManager';

// Services
export { productService } from './services/productService';
export { categoryService } from './services/categoryService';

// Hooks
export { useProducts, useProduct } from './hooks/useProducts';
export { useProductForm } from './hooks/useProductForm';

// Types
export type {
	Product,
	ProductCategory,
	ProductImage,
	ProductOption,
	ProductOrderItem,
	CreateProductPayload,
} from './types/product';