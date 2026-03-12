import { LogOut, Package, Settings, ShoppingCart, Users } from "lucide-react";
import { Link, Outlet, useLocation, useNavigate } from "react-router-dom";
import { cn } from "@/lib/utils";
import { useAuth } from "../../contexts/AuthContext";

const navigation = [
	{ name: "Produtos", href: "/products", icon: Package },
	{ name: "Pedidos", href: "/orders", icon: ShoppingCart },
	{ name: "Usuários", href: "/users", icon: Users },
	{ name: "Configurações", href: "/settings", icon: Settings },
];

export function AdminLayout() {
	const location = useLocation();
	const navigate = useNavigate();
	const { user, logout } = useAuth();

	const handleLogout = async () => {
		await logout();
		navigate("/login", { replace: true });
	};

	const getUserInitials = () => {
		if (!user) return "A";
		return (
			`${user.firstname?.[0] || ""}${user.surname?.[0] || ""}`.toUpperCase() ||
			"U"
		);
	};

	return (
		<div className="flex h-screen bg-[#f5f5f5]">
			{/* Sidebar */}
			<aside className="w-64 bg-white border-r border-gray-200 flex flex-col">
				<div className="h-16 flex items-center px-6 border-b border-gray-200">
					<Link to="/" className="flex items-center gap-2">
						<div className="w-8 h-8 bg-primary rounded-md flex items-center justify-center">
							<span className="text-white font-bold text-xl">D</span>
						</div>
						<span className="text-primary font-bold text-xl tracking-tight">
							Digital Store
						</span>
					</Link>
				</div>

				<div className="flex-1 overflow-y-auto py-4">
					<nav className="px-3 space-y-1">
						{navigation.map((item) => {
							const isActive = location.pathname.startsWith(item.href);

							return (
								<Link
									key={item.name}
									to={item.href}
									className={cn(
										"group flex items-center px-3 py-2 text-sm font-medium rounded-md transition-colors",
										isActive
											? "bg-primary/10 text-primary"
											: "text-gray-700 hover:bg-gray-100",
									)}
								>
									<item.icon
										className={cn(
											"mr-3 flex-shrink-0 h-5 w-5",
											isActive
												? "text-primary"
												: "text-gray-400 group-hover:text-gray-500",
										)}
										aria-hidden="true"
									/>
									{item.name}
								</Link>
							);
						})}
					</nav>
				</div>

				<div className="p-4 border-t border-gray-200">
					<button
						onClick={handleLogout}
						className="flex items-center w-full px-3 py-2 text-sm font-medium text-gray-700 rounded-md hover:bg-gray-100 transition-colors"
					>
						<LogOut className="mr-3 h-5 w-5 text-gray-400" />
						Sair
					</button>
				</div>
			</aside>

			{/* Main Content */}
			<main className="flex-1 flex flex-col overflow-hidden">
				<header className="h-16 bg-white border-b border-gray-200 flex items-center justify-end px-6">
					<div className="flex items-center gap-3">
						<div className="text-sm text-right">
							<p className="font-medium text-gray-900">
								{user ? `${user.firstname} ${user.surname}` : "Admin User"}
							</p>
							<p className="text-gray-500">
								{user?.email || "admin@digitalstore.com"}
							</p>
						</div>
						<div className="h-10 w-10 rounded-full bg-primary/20 flex items-center justify-center text-primary font-bold">
							{getUserInitials()}
						</div>
					</div>
				</header>

				<div className="flex-1 overflow-auto p-8">
					<Outlet />
				</div>
			</main>
		</div>
	);
}
