import { Plus, Trash2 } from "lucide-react";
import type { UseFormRegister, FieldErrors, UseFormSetValue } from "react-hook-form";
import { useQuery } from "@tanstack/react-query";
import { categoryService } from "../../services/categoryService";

interface ProductOptionsManagerProps {
	register: UseFormRegister<any>;
	errors: FieldErrors<any>;
	setValue: UseFormSetValue<any>;
	optionFields: any[];
	appendOption: (value: any) => void;
	removeOption: (index: number) => void;
	calculatedDiscountPrice: number | null;
}

export function ProductOptionsManager({
	register,
	errors,
	setValue,
	optionFields,
	appendOption,
	removeOption,
	calculatedDiscountPrice,
}: ProductOptionsManagerProps) {

	// Fetch categories for the multi-select
	const { data: categories = [] } = useQuery({
		queryKey: ["categories"],
		queryFn: categoryService.getCategories,
	});

	return (
		<div className="lg:col-span-5 flex flex-col gap-10 lg:border-l lg:pl-10 border-gray-100">
			{/* Preços e Estoque */}
			<section className="space-y-6">
				<h3 className="text-lg font-bold text-gray-900 flex items-center gap-2">
					<span className="w-1.5 h-6 bg-primary rounded-full" />
					Preços e Estoque
				</h3>

				<div className="grid grid-cols-1 md:grid-cols-2 gap-5">
					<div className="space-y-2">
						<label htmlFor="price" className="text-sm font-semibold text-gray-700">Preço Base (R$)</label>
						<input
							id="price"
							type="number"
							step="0.01"
							{...register("price")}
							className={`w-full h-11 px-4 rounded-xl border ${errors.price ? 'border-error' : 'border-gray-200'} bg-gray-50/50 focus:bg-white focus:ring-4 focus:ring-primary/10 focus:border-primary transition-all outline-none`}
						/>
						{errors.price && <span className="text-xs text-error font-medium">{String(errors.price.message)}</span>}
					</div>
					<div className="space-y-2">
						<label htmlFor="priceWithDiscount" className="text-sm font-semibold text-gray-700">Desconto (%)</label>
						<input
							id="priceWithDiscount"
							type="number"
							min="0"
							max="100"
							{...register("priceWithDiscount")}
							className={`w-full h-11 px-4 rounded-xl border ${errors.priceWithDiscount ? 'border-error' : 'border-gray-200'} bg-gray-50/50 focus:bg-white focus:ring-4 focus:ring-primary/10 focus:border-primary transition-all outline-none`}
						/>
						{errors.priceWithDiscount && <span className="text-xs text-error font-medium">{String(errors.priceWithDiscount.message)}</span>}
					</div>
				</div>

				<div className="flex items-center justify-between p-4 rounded-2xl bg-primary/5 border border-primary/10">
					<span className="text-sm font-bold text-gray-600">Preço Final Calculado</span>
					<span className="text-xl font-black text-primary">
						{calculatedDiscountPrice !== null ? `R$ ${calculatedDiscountPrice.toFixed(2)}` : 'R$ 0.00'}
					</span>
				</div>

				<div className="grid grid-cols-1 md:grid-cols-1 gap-5">
					<div className="space-y-2">
						<label htmlFor="stock" className="text-sm font-semibold text-gray-700">Estoque Disponível</label>
						<input
							id="stock"
							type="number"
							{...register("stock")}
							className={`w-full h-11 px-4 rounded-xl border ${errors.stock ? 'border-error' : 'border-gray-200'} bg-white focus:ring-4 focus:ring-primary/10 focus:border-primary transition-all outline-none shadow-sm`}
						/>
						{errors.stock && <span className="text-xs text-error font-medium">{String(errors.stock.message)}</span>}
					</div>
				</div>

				<div className="flex flex-col gap-3 pt-2">
					<label className="flex items-center gap-3 cursor-pointer group">
						<input type="checkbox" {...register("enabled")} className="w-5 h-5 rounded-md border-gray-300 text-primary accent-primary" />
						<span className="text-sm text-gray-700 font-semibold">Produto Disponível na Loja</span>
					</label>
					<label className="flex items-center gap-3 cursor-pointer group">
						<input type="checkbox" {...register("useInMenu")} className="w-5 h-5 rounded-md border-gray-300 text-primary accent-primary" />
						<span className="text-sm text-gray-700 font-semibold">Destacar no Menu de Navegação</span>
					</label>
				</div>
			</section>

			{/* Opções e Atributos */}
			<section className="space-y-6">
				<div className="flex items-center justify-between">
					<h3 className="text-lg font-bold text-gray-900 flex items-center gap-2">
						<span className="w-1.5 h-6 bg-primary rounded-full" />
						Opções e Atributos
					</h3>
					<button
						type="button"
						onClick={() => appendOption({ title: "", type: "text", shape: "square", values: "" })}
						className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-primary hover:bg-primary/5 font-bold text-sm transition-all"
					>
						<Plus className="w-4 h-4" /> Adicionar
					</button>
				</div>

				<div className="space-y-4">
					{optionFields.map((field, index) => (
						<div key={field.id} className="p-5 border border-gray-100 rounded-xl bg-white shadow-sm relative group hover:shadow-md transition-all border-l-4 border-l-primary/30">
							<button
								type="button"
								onClick={() => removeOption(index)}
								className="absolute top-3 right-3 p-1.5 text-gray-300 hover:text-error hover:bg-error/5 rounded-lg transition-all"
							>
								<Trash2 className="w-4 h-4" />
							</button>
							<div className="grid grid-cols-1 gap-4 mb-4">
								<div className="space-y-1">
									<label className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">Título</label>
									<input
										{...register(`options.${index}.title` as const)}
										placeholder="Tamanho, Cor..."
										className={`w-full h-8 px-0 border-b ${(errors.options as any)?.[index]?.title ? 'border-error' : 'border-gray-100'} focus:border-primary bg-transparent outline-none text-sm transition-colors`}
									/>
									{(errors.options as any)?.[index]?.title && <span className="text-[10px] text-error font-medium">{String((errors.options as any)[index].title.message)}</span>}
								</div>
								<div className="space-y-1">
									<label className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">Tipo</label>
									<select
										{...register(`options.${index}.type` as const)}
										className="w-full h-8 bg-transparent border-b border-gray-100 outline-none text-sm cursor-pointer"
										onChange={(e) => {
											// Update internal value for immediate validation if needed
											setValue(`options.${index}.type`, e.target.value);
										}}
									>
										<option value="text">Texto (Ex: P, M, G)</option>
										<option value="color">Cor (Ex: #FFF, #000)</option>
									</select>
								</div>
							</div>
							<div className="space-y-1">
								<label className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">Valores (separados por vírgula)</label>
								<input
									{...register(`options.${index}.values` as any)}
									placeholder="P, M, G ou #FFF, #000"
									className={`w-full h-8 px-0 border-b ${(errors.options as any)?.[index]?.values ? 'border-error' : 'border-gray-100'} focus:border-primary bg-transparent outline-none text-sm transition-colors`}
								/>
								{(errors.options as any)?.[index]?.values && <span className="text-[10px] text-error font-medium">{String((errors.options as any)[index].values.message)}</span>}
							</div>
						</div>
					))}
				</div>
			</section>

			{/* Categorias */}
			<section className="space-y-5">
				<h3 className="text-lg font-bold text-gray-900 flex items-center gap-2">
					<span className="w-1.5 h-6 bg-tertiary rounded-full" /> Categorias
				</h3>
				<div className="grid grid-cols-1 md:grid-cols-2 gap-3 max-h-[250px] overflow-y-auto p-5 bg-gray-50/50 rounded-2xl border border-gray-100 custom-scrollbar">
					{categories.map((cat) => (
						<label key={cat.id} className="flex items-center gap-3 p-3 bg-white rounded-xl cursor-pointer transition-all border border-transparent hover:border-primary/20 hover:shadow-sm group">
							<div className="relative flex items-center">
								<input
									type="checkbox"
									value={cat.id}
									{...register("categoryIds")}
									className="w-5 h-5 rounded-md border-gray-300 text-tertiary focus:ring-tertiary/20 peer accent-tertiary"
								/>
							</div>
							<span className="text-sm text-gray-600 font-semibold group-hover:text-tertiary truncate">{cat.name}</span>
						</label>
					))}
				</div>
				{errors.categoryIds && <span className="text-xs text-error font-medium">{String(errors.categoryIds.message)}</span>}
			</section>
		</div>
	);
}