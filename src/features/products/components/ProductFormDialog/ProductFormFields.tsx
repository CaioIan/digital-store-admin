import type { UseFormRegister, FieldErrors } from "react-hook-form";

interface ProductFormFieldsProps {
	register: UseFormRegister<any>;
	errors: FieldErrors<any>;
}

export function ProductFormFields({ register, errors }: ProductFormFieldsProps) {
	return (
		<section className="space-y-6">
			<h3 className="text-lg font-bold text-gray-900 flex items-center gap-2">
				<span className="w-1.5 h-6 bg-primary rounded-full" />
				Informações Básicas
			</h3>

			<div className="grid grid-cols-1 md:grid-cols-2 gap-5">
				<div className="space-y-2">
					<label htmlFor="name" className="text-sm font-semibold text-gray-700">Nome do Produto</label>
					<input
						id="name"
						{...register("name")}
						placeholder="Ex: Tênis Nike Air Max"
						className={`w-full h-11 px-4 rounded-xl border ${errors.name ? 'border-error' : 'border-gray-200'} bg-gray-50/50 focus:bg-white focus:ring-4 focus:ring-primary/10 focus:border-primary transition-all outline-none`}
					/>
					{errors.name && <span className="text-xs text-error font-medium">{String(errors.name.message)}</span>}
				</div>
				<div className="space-y-2">
					<label htmlFor="brand" className="text-sm font-semibold text-gray-700">Marca (Opcional)</label>
					<input
						id="brand"
						{...register("brand")}
						placeholder="Ex: Nike, Adidas"
						className={`w-full h-11 px-4 rounded-xl border ${errors.brand ? 'border-error' : 'border-gray-200'} bg-gray-50/50 focus:bg-white focus:ring-4 focus:ring-primary/10 focus:border-primary transition-all outline-none`}
					/>
					{errors.brand && <span className="text-xs text-error font-medium">{String(errors.brand.message)}</span>}
				</div>
			</div>

			<div className="grid grid-cols-1 md:grid-cols-2 gap-5">
				<div className="space-y-2">
					<label htmlFor="slug" className="text-sm font-semibold text-gray-700">Slug (URL)</label>
					<input
						id="slug"
						{...register("slug")}
						placeholder="tenis-nike-air-max"
						className={`w-full h-11 px-4 rounded-xl border ${errors.slug ? 'border-error' : 'border-gray-200'} bg-gray-50/50 focus:bg-white focus:ring-4 focus:ring-primary/10 focus:border-primary transition-all outline-none`}
					/>
					{errors.slug && <span className="text-xs text-error font-medium">{String(errors.slug.message)}</span>}
				</div>
				<div className="space-y-2">
					<label htmlFor="gender" className="text-sm font-semibold text-gray-700">Gênero</label>
					<select
						id="gender"
						{...register("gender")}
						className={`w-full h-11 px-4 rounded-xl border ${errors.gender ? 'border-error' : 'border-gray-200'} bg-gray-50/50 focus:bg-white focus:ring-4 focus:ring-primary/10 focus:border-primary transition-all outline-none cursor-pointer`}
					>
						<option value="Masculino">Masculino</option>
						<option value="Feminino">Feminino</option>
						<option value="Unisex">Unisex</option>
					</select>
					{errors.gender && <span className="text-xs text-error font-medium">{String(errors.gender.message)}</span>}
				</div>
			</div>

			<div className="space-y-2">
				<label htmlFor="description" className="text-sm font-semibold text-gray-700">Descrição (Mín. 10 caracteres)</label>
				<textarea
					id="description"
					{...register("description")}
					rows={4}
					className={`w-full p-4 rounded-xl border ${errors.description ? 'border-error' : 'border-gray-200'} bg-gray-50/50 focus:bg-white focus:ring-4 focus:ring-primary/10 focus:border-primary transition-all outline-none resize-none`}
					placeholder="Conte mais sobre o produto..."
				/>
				{errors.description && <span className="text-xs text-error font-medium">{String(errors.description.message)}</span>}
			</div>
		</section>
	);
}