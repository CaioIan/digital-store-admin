import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Navigate, Route, Routes } from "react-router-dom";
import { Toaster } from "sonner";

import { AdminLayout } from "./features/layout";
import { AuthProvider, RequireAuth, LoginPage } from "./features/auth";
import { UserListingPage } from "./features/users";
import { OrderListingPage } from "./features/orders";
import { ProductListingPage, ProductEditPage } from "./features/products";
import { CategoryListingPage } from "./features/categories";

const queryClient = new QueryClient();

function App() {
	return (
		<QueryClientProvider client={queryClient}>
			<BrowserRouter>
				<AuthProvider>
					<Routes>
						<Route path="/login" element={<LoginPage />} />

						<Route
							path="/"
							element={
								<RequireAuth>
									<AdminLayout />
								</RequireAuth>
							}
						>
							<Route index element={<Navigate to="/products" replace />} />
							<Route path="products" element={<ProductListingPage />} />
							<Route path="products/:id/edit" element={<ProductEditPage />} />
							<Route path="categories" element={<CategoryListingPage />} />
							<Route path="orders" element={<OrderListingPage />} />
							<Route path="users" element={<UserListingPage />} />
							<Route
								path="settings"
								element={<div>Configurações Content</div>}
							/>
						</Route>

						<Route path="*" element={<Navigate to="/products" replace />} />
					</Routes>
				</AuthProvider>
			</BrowserRouter>
			<Toaster richColors position="top-right" />
		</QueryClientProvider>
	);
}

export default App;
