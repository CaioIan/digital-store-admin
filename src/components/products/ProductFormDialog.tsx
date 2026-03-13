import { zodResolver } from "@hookform/resolvers/zod";
import * as Dialog from "@radix-ui/react-dialog";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
	ArrowDown,
	ArrowUp,
	ImageIcon,
	Loader2,
	Plus,
	Trash2,
	Upload,
	X
} from "lucide-react";
import { useEffect, useState } from "react";
import { useFieldArray, useForm } from "react-hook-form";
import { toast } from "sonner";
import { categoryService } from "../../services/categoryService";
import { productService, type CreateProductPayload, type Product } from "../../services/productService";
import { productSchema } from "./ProductSchema";

interface ProductFormDialogProps {
	open: boolean;
	onOpenChange: (open: boolean) => void;
	product?: Product;
}

export function ProductFormDialog({ open, onOpenChange, product }: ProductFormDialogProps) {
	const isEditMode = !!product;
	const queryClient = useQueryClient();
	const [selectedFiles, setSelectedFiles] = useState<File[]>([]);
	const [isUploadingImages, setIsUploadingImages] = useState(false);
	const [isSuccess, setIsSuccess] = useState(false);

	const { 
		register, 
		handleSubmit, 
		control, 
		reset, 
		watch, 
		setValue, 
		setError,
		formState: { errors, isSubmitting } 
	} = useForm<any>({
		resolver: zodResolver(productSchema),
		defaultValues: {
			enabled: product?.enabled ?? true,
			useInMenu: product?.use_in_menu ?? false,
			stock: product?.stock ?? 0,
			gender: product?.gender ?? "Unisex",
			options: product?.options?.map(opt => ({
				...opt,
				values: opt.values.join(", ")
			})) ?? [],
			categoryIds: product?.categories?.map(c => c.id) ?? [],
			images: product?.images?.map(img => ({ 
				type: "image/existing", 
				content: img.path || img.content 
			})) ?? [],
			name: product?.name ?? "",
			slug: product?.slug ?? "",
			brand: product?.brand ?? "",
			description: product?.description ?? "",
			price: product?.price ?? 0,
			priceWithDiscount: product?.price && product?.price_with_discount 
				? Math.round((1 - (product.price_with_discount / product.price)) * 100)
				: 0,
		},
	});

	// Pre-fill images state for previews
	const [existingImagesView, setExistingImagesView] = useState<{ id?: string, url: string, type: string, file?: File }[]>(
		product?.images?.map(img => ({ 
			id: String(img.id),
			url: img.path || img.content || "", 
			type: "image/existing" 
		})) ?? []
	);

	useEffect(() => {
		if (product && !isSuccess) {
			reset({
				enabled: product.enabled,
				useInMenu: product.use_in_menu,
				stock: product.stock,
				gender: product.gender,
				options: product.options?.map(opt => ({
					...opt,
					values: opt.values.join(", ")
				})) ?? [],
				categoryIds: product.categories?.map(c => c.id) ?? [],
				images: product.images?.map(img => ({ 
					type: "image/existing", 
					content: img.path || img.content 
				})) ?? [],
				name: product.name,
				slug: product.slug,
				brand: product.brand || "",
				description: product.description || "",
				price: product.price,
				priceWithDiscount: product.price && product.price_with_discount 
					? Math.round((1 - (product.price_with_discount / product.price)) * 100)
					: 0,
			});
			setExistingImagesView(product.images?.map(img => ({ 
				id: String(img.id),
				url: img.path || img.content || "", 
				type: "image/existing" 
			})) ?? []);
		}
	}, [product, reset, isSuccess]);

	const { fields: optionFields, append: appendOption, remove: removeOption } = useFieldArray({
		control,
		name: "options",
	});

	// Watch for real-time pricing calculation
	const priceValue = watch("price");
	const discountPercentage = watch("priceWithDiscount");
	const [calculatedDiscountPrice, setCalculatedDiscountPrice] = useState<number | null>(null);

	useEffect(() => {
		const basePrice = Number(priceValue);
		const discount = Number(discountPercentage || 0);

		if (!isNaN(basePrice) && basePrice > 0) {
			// Clamping for preview purposes only
			const safeDiscount = Math.min(Math.max(discount, 0), 100);
			const finalPrice = basePrice - (basePrice * (safeDiscount / 100));
			setCalculatedDiscountPrice(Number(finalPrice.toFixed(2)));
		} else {
			setCalculatedDiscountPrice(null);
		}
	}, [priceValue, discountPercentage]);

	// Auto-generate slug from name
	const nameValue = watch("name");
	useEffect(() => {
		if (nameValue) {
			const generatedSlug = nameValue
				.toLowerCase()
				.trim()
				.normalize("NFD")
				.replace(/[\u0300-\u036f]/g, "")
				.replace(/[^a-z0-9]+/g, "-")
				.replace(/^-+|-+$/g, "");
			
			// Only update if slug is currently empty or was not manually edited (simplification)
			setValue("slug", generatedSlug, { shouldValidate: true });
		}
	}, [nameValue, setValue]);

	// Fetch categories for the multi-select
	const { data: categories = [] } = useQuery({
		queryKey: ["categories"],
		queryFn: categoryService.getCategories,
	});

	const createProductMutation = useMutation({
		mutationFn: (payload: CreateProductPayload) => 
			isEditMode 
				? productService.updateProduct(String(product.id), payload)
				: productService.createProduct(payload),
		onSuccess: () => {
			setIsSuccess(true);
			onOpenChange(false);
			toast.success(isEditMode ? "Produto atualizado com sucesso!" : "Produto criado com sucesso!");
			
			queryClient.invalidateQueries({ queryKey: ["products"] });
			if (isEditMode) {
				queryClient.invalidateQueries({ queryKey: ["product", String(product.id)] });
			}
			
			// Timing delay to let the dialog close before clearing states
			setTimeout(() => {
				reset();
				setSelectedFiles([]);
				setExistingImagesView([]);
				setIsSuccess(false);
			}, 500);
		},
		onError: (error: any) => {
			if (error.response?.status === 400 && error.response.data?.errors) {
				const apiErrors = error.response.data.errors;
				apiErrors.forEach((apiErr: { field: string, message: string }) => {
					let fieldName = apiErr.field;
					// Map backend snake_case to frontend camelCase if needed
					if (fieldName === 'price_with_discount') fieldName = 'priceWithDiscount';
					if (fieldName === 'use_in_menu') fieldName = 'useInMenu';
					if (fieldName === 'category_ids') fieldName = 'categoryIds';
					
					setError(fieldName as any, { 
						type: 'manual', 
						message: apiErr.message || 'Campo inválido' 
					});
				});
				toast.error('O formulário contém campos inválidos.');
			} else {
				toast.error(isEditMode ? 'Erro ao atualizar o produto.' : 'Erro ao criar o produto.');
			}
		},
	});

	const onSubmit = async (data: any) => {
		let finalImages: { type: string, content: string }[] = [];

		// Passo 2: Upload das NOVAS Imagens (se houver) e montagem do array final respeitando a ORDEM do UI
		setIsUploadingImages(true);
		try {
			const uploadedUrlsMap = new Map<string, string>(); // blobUrl -> remoteUrl
			
			if (selectedFiles.length > 0) {
				const formData = new FormData();
				selectedFiles.forEach(file => {
					formData.append('images', file);
				});
				
				const uploadResponse = await productService.uploadImages(formData);
				// Mapeamos o arquivo original (via URL do objeto) para a URL remota
				selectedFiles.forEach((file: File, index: number) => {
					// Procuramos o preview que tem este arquivo
					const preview = existingImagesView.find((img: any) => img.file === file);
					if (preview) {
						uploadedUrlsMap.set(preview.url, uploadResponse[index].url);
					}
				});
			}

			// Agora montamos o payload final baseado na ORDEM do existingImagesView
			finalImages = existingImagesView.map((img: any) => {
				if (img.type === "image/existing") {
					return {
						type: "image/existing",
						content: img.url
					};
				} else {
					// Imagem nova, pegar a URL remota que acabamos de receber
					const remoteUrl = uploadedUrlsMap.get(img.url);
					return {
						type: img.type,
						content: remoteUrl || img.url
					};
				}
			});
		} catch (error) {
			toast.error("Falha ao enviar as imagens. A operação foi cancelada.");
			setIsUploadingImages(false);
			return;
		}
		setIsUploadingImages(false);

		// Passo 3: Cálculo do Preço Final Absoluto
		const basePrice = Number(data.price);
		const discount = Number(data.priceWithDiscount || 0);
		
		// Always send price_with_discount to avoid keeping old discounted values on PATCH
		const absolutePriceWithDiscount = Number((basePrice - (basePrice * (discount / 100))).toFixed(2));

		const payload: any = {
			enabled: data.enabled,
			name: data.name,
			slug: data.slug,
			use_in_menu: data.useInMenu,
			stock: Number(data.stock),
			description: data.description,
			brand: data.brand || undefined,
			gender: data.gender,
			price: basePrice,
			price_with_discount: absolutePriceWithDiscount,
			category_ids: data.categoryIds,
			images: finalImages,
			options: data.options.map((opt: any) => {
				const values = typeof opt.values === 'string' 
					? opt.values.split(',').map((v: string) => v.trim()).filter(Boolean) 
					: opt.values;
				
				// Mandatory enforcement of shape based on type per API rules
				return {
					title: opt.title,
					type: opt.type,
					shape: opt.type === "color" ? "circle" : "square",
					values: values
				};
			}),
		};

		// Artificial delay for UI smoothness (avoid flickering for very fast connections)
		await new Promise(resolve => setTimeout(resolve, 800));

		try {
			await createProductMutation.mutateAsync(payload);
		} catch (error) {
			// Error is already handled by the mutation's onError
		}
	};

	const handleFileSelect = (files: FileList | null) => {
		if (!files) return;
		const newFiles = Array.from(files);
		setSelectedFiles(prev => [...prev, ...newFiles]);
		
		const newPreviewItems = newFiles.map(f => {
			const blobUrl = URL.createObjectURL(f);
			return { id: blobUrl, url: blobUrl, type: f.type, file: f };
		});
		setExistingImagesView(prev => [...prev, ...newPreviewItems]);
		
		// Atualiza o estado do formulário para passar na validação do Zod
		const allImagesForValidation = [...existingImagesView, ...newPreviewItems];
		setValue("images", allImagesForValidation.map(img => ({ type: img.type, content: img.url })), { shouldValidate: true });
	};

	const removeSelectedFile = (index: number) => {
		const imgToRemove = existingImagesView[index];
		
		if (imgToRemove.type !== "image/existing" && imgToRemove.file) {
			setSelectedFiles(prev => prev.filter(f => f !== imgToRemove.file));
			URL.revokeObjectURL(imgToRemove.url);
		}

		const updatedExistingView = existingImagesView.filter((_, i: number) => i !== index);
		setExistingImagesView(updatedExistingView);
		
		// Se não houver imagens, limpa o campo para disparar o erro .min(1)
		setValue("images", updatedExistingView.length > 0 
			? updatedExistingView.map((img: any) => ({ type: img.type, content: img.url }))
			: [], 
			{ shouldValidate: true }
		);
	};

	const moveImage = (index: number, direction: 'up' | 'down') => {
		const newImgs = [...existingImagesView];
		const targetIndex = direction === 'up' ? index - 1 : index + 1;
		if (targetIndex >= 0 && targetIndex < newImgs.length) {
			[newImgs[index], newImgs[targetIndex]] = [newImgs[targetIndex], newImgs[index]];
			setExistingImagesView(newImgs);
			setValue("images", newImgs.map(img => ({ type: img.type, content: img.url })));
		}
	};

	const onFormError = (errs: any) => {
		console.error("❌ ERRO DE VALIDAÇÃO LOCAL:", errs);
		
		const errorFields = Object.keys(errs).join(", ");
		toast.error(`Campos inválidos: ${errorFields}. Verifique o console (F12) para detalhes.`);
	};

	return (
		<Dialog.Root open={open} onOpenChange={onOpenChange}>
			<Dialog.Portal>
				<Dialog.Overlay className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0" />
				<Dialog.Content className="fixed left-[50%] top-[50%] z-50 w-full max-w-5xl translate-x-[-50%] translate-y-[-50%] gap-0 border-none bg-white p-0 shadow-2xl duration-200 data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0 data-[state=closed]:zoom-out-95 data-[state=open]:zoom-in-95 data-[state=closed]:slide-out-to-left-1/2 data-[state=closed]:slide-out-to-top-[48%] data-[state=open]:slide-in-from-left-1/2 data-[state=open]:slide-in-from-top-[48%] sm:rounded-3xl max-h-[90vh] overflow-y-auto custom-scrollbar">
					<div className="bg-white p-8 space-y-8">
						<div className="flex flex-row items-center justify-between space-y-0">
							<div className="space-y-1.5">
								<Dialog.Title className="text-2xl font-black text-gray-900 tracking-tight">
									{isEditMode ? 'Editar Produto' : 'Novo Produto'}
								</Dialog.Title>
								<Dialog.Description className="text-gray-500 font-medium">
									{isEditMode ? 'Atualize as informações do item selecionado.' : 'Cadastre um novo item no catálogo com detalhes e mídias.'}
								</Dialog.Description>
							</div>
						<button 
							onClick={() => onOpenChange(false)}
							className="p-3 hover:bg-gray-100 rounded-2xl transition-all group"
						>
							<X className="w-5 h-5 text-gray-400 group-hover:text-gray-900 group-hover:rotate-90 transition-all duration-300" />
						</button>
						</div>

					<form onSubmit={handleSubmit(onSubmit, onFormError)} className="space-y-10 pb-4">
						<div className="grid grid-cols-1 lg:grid-cols-12 gap-10">
							{/* Coluna Esquerda: Dados Principais e Mídia */}
							<div className="lg:col-span-7 space-y-8">
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

								{/* Mídia do Produto */}
								<section className="space-y-5">
									<h3 className="text-lg font-bold text-gray-900 flex items-center gap-2">
										<ImageIcon className="w-5 h-5 text-primary" /> Mídia do Produto
									</h3>
									
									<div 
										onDragOver={(e) => e.preventDefault()}
										onDrop={(e) => {
											e.preventDefault();
											handleFileSelect(e.dataTransfer.files);
										}}
										className="border-2 border-dashed border-gray-200 rounded-2xl p-10 text-center hover:border-primary hover:bg-primary/5 transition-all cursor-pointer group bg-gray-50/30"
										onClick={() => document.getElementById('file-upload')?.click()}
									>
										<div className="w-12 h-12 rounded-full bg-white flex items-center justify-center mx-auto mb-4 shadow-sm group-hover:scale-110 transition-transform">
											<Upload className="w-6 h-6 text-primary" />
										</div>
										<p className="text-sm text-gray-700 font-bold mb-1">Drag & Drop</p>
										<p className="text-xs text-gray-400 font-medium px-4">Arraste suas imagens ou clique para buscar arquivos locais</p>
										<input
											id="file-upload"
											type="file"
											multiple
											accept="image/*"
											className="hidden"
											onChange={(e) => handleFileSelect(e.target.files)}
										/>
									</div>
									{errors.images && <span className="text-xs text-error font-medium block mt-1">{String(errors.images.message)}</span>}

									{/* Grid de Previews */}
									<div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4 max-h-[500px] overflow-y-auto pr-2 custom-scrollbar p-1">
										{existingImagesView.map((img, index) => (
											<div key={`${img.url}-${index}`} className="flex flex-col p-3 bg-white rounded-xl border border-gray-100 shadow-sm group hover:border-primary/30 transition-all">
												<div className="relative aspect-square w-full rounded-lg overflow-hidden bg-gray-50 border border-gray-100">
													<img
														src={img.url}
														alt="Preview"
														className="w-full h-full object-cover"
													/>
													<div className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
														<button
															type="button"
															onClick={() => removeSelectedFile(index)}
															className="p-1.5 bg-white rounded-full text-error hover:scale-110 transition-all"
														>
															<Trash2 className="w-3.5 h-3.5" />
														</button>
													</div>
												</div>
												<div className="mt-3 flex items-center justify-between">
													<div className="flex flex-col">
														<span className="text-[10px] font-bold text-gray-400 uppercase">Posição</span>
														<div className="flex items-center gap-1.5">
															<span className="text-sm font-bold text-gray-700">#{index + 1}</span>
															{index === 0 && (
																<span className="text-[9px] font-bold text-amber-600 bg-amber-50 px-1 rounded border border-amber-100">CAPA</span>
															)}
														</div>
													</div>
													<div className="flex gap-1">
														<button
															type="button"
															disabled={index === 0}
															onClick={() => moveImage(index, 'up')}
															className="p-1.5 hover:bg-primary/5 rounded-lg border border-gray-100 disabled:opacity-30 transition-all shadow-sm"
														>
															<ArrowUp className="w-3.5 h-3.5 text-gray-500" />
														</button>
														<button
															type="button"
															disabled={index === existingImagesView.length - 1}
															onClick={() => moveImage(index, 'down')}
															className="p-1.5 hover:bg-primary/5 rounded-lg border border-gray-100 disabled:opacity-30 transition-all shadow-sm"
														>
															<ArrowDown className="w-3.5 h-3.5 text-gray-500" />
														</button>
													</div>
												</div>
											</div>
										))}
									</div>
								</section>
							</div>

							{/* Coluna Direita: Preços, Opções e Categorias */}
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
						</div>

						{/* Footer com Botão de Ação */}
						<div className="flex items-center justify-end gap-4 pt-6 mt-8 border-t border-gray-100">
							<button
								type="button"
								onClick={() => onOpenChange(false)}
								className="px-6 py-2.5 rounded-xl text-gray-500 font-bold hover:bg-gray-50 transition-all border border-transparent hover:border-gray-100"
							>
								Cancelar
							</button>
							<button
								type="submit"
								disabled={isSubmitting || isUploadingImages || createProductMutation.isPending || isSuccess}
								className="px-8 py-2.5 rounded-xl bg-primary text-white font-black hover:bg-tertiary transition-all shadow-lg shadow-primary/20 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2 min-w-[180px] justify-center"
							>
								{(isSubmitting || isUploadingImages || createProductMutation.isPending || isSuccess) ? (
									<>
										<Loader2 className="w-5 h-5 animate-spin" />
										{isUploadingImages ? 'Tratando Mídias...' : 'Salvando...'}
									</>
								) : (
									isEditMode ? 'Salvar Alterações' : 'Criar Produto'
								)}
							</button>
						</div>
					</form>
				</div>
			</Dialog.Content>
		</Dialog.Portal>
	</Dialog.Root>
	);
}
