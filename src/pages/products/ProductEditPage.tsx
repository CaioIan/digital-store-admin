import { useQuery } from "@tanstack/react-query";
import { useParams, useNavigate } from "react-router-dom";
import { productService } from "../../services/productService";
import { ProductFormDialog } from "../../components/products/ProductFormDialog";
import { ArrowLeft, Loader2 } from "lucide-react";

export function ProductEditPage() {
	const { id } = useParams<{ id: string }>();
	const navigate = useNavigate();

	const { data: product, isLoading, isError } = useQuery({
		queryKey: ["product", id],
		queryFn: () => productService.getProductById(id!),
		enabled: !!id,
	});

	if (isLoading) {
		return (
			<div className="flex flex-col items-center justify-center min-h-[400px] space-y-4">
				<Loader2 className="w-8 h-8 animate-spin text-primary" />
				<p className="text-gray-500 font-medium">Carregando dados do produto...</p>
			</div>
		);
	}

	if (isError || !product) {
		return (
			<div className="flex flex-col items-center justify-center min-h-[400px] space-y-4">
				<p className="text-error font-bold">Erro ao carregar produto.</p>
				<button 
					onClick={() => navigate("/products")}
					className="flex items-center gap-2 text-primary font-bold hover:underline"
				>
					<ArrowLeft className="w-4 h-4" /> Voltar para listagem
				</button>
			</div>
		);
	}

	return (
		<div className="space-y-6">
			<div className="flex items-center gap-4">
				<button 
					onClick={() => navigate("/products")}
					className="p-2 hover:bg-gray-100 rounded-xl transition-all"
				>
					<ArrowLeft className="w-5 h-5 text-gray-600" />
				</button>
				<div>
					<h1 className="text-2xl font-black text-gray-900 tracking-tight">Editar Produto</h1>
					<p className="text-gray-500 font-medium">Atualize as informações de #{id} - {product.name}</p>
				</div>
			</div>

			<ProductFormDialog 
				open={true} 
				onOpenChange={(open) => !open && navigate("/products")}
				product={product}
			/>
		</div>
	);
}
