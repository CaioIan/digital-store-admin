import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Navigate, Route, Routes } from "react-router-dom";
import { Toaster } from "sonner";

import { AdminLayout } from "./components/layout/AdminLayout";
import { RequireAuth } from "./components/layout/RequireAuth";
import { AuthProvider } from "./contexts/AuthContext";

import { LoginPage } from "./pages/auth/LoginPage";
import { ProductListingPage } from "./pages/products/ProductListingPage";

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
							<Route path="orders" element={<div>Usuários Content</div>} />
							<Route path="users" element={<div>Configurações Content</div>} />
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
