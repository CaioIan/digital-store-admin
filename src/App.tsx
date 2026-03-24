import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Navigate, Route, Routes } from "react-router-dom";
import { Toaster } from "sonner";

import { AdminLayout } from "./components/layout/AdminLayout";
import { RequireAdminAuth } from "./components/layout/RequireAdminAuth";
import { AuthProvider } from "./contexts/AuthContext";

import { LoginPage } from "./pages/auth/LoginPage";
import { OrderListingPage } from "./pages/orders/OrderListingPage";
import { ProductListingPage } from "./pages/products/ProductListingPage";
import { ProductEditPage } from "./pages/products/ProductEditPage";
import { UserListingPage } from "./pages/users/UserListingPage";

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
								<RequireAdminAuth>
									<AdminLayout />
								</RequireAdminAuth>
							}
						>
							<Route index element={<Navigate to="/products" replace />} />
							<Route path="products" element={<ProductListingPage />} />
							<Route path="products/:id/edit" element={<ProductEditPage />} />
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
