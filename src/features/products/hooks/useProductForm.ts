import { useEffect, useState } from "react";
import { useForm, useFieldArray } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { productService } from "../services/productService";
import type { CreateProductPayload, Product } from "../types/product";
import { productSchema } from "../schemas/ProductSchema";

interface UseProductFormParams {
	product?: Product;
	onSuccess?: () => void;
	isEditMode: boolean;
}

export function useProductForm({ product, onSuccess, isEditMode }: UseProductFormParams) {
	const queryClient = useQueryClient();
	const [selectedFiles, setSelectedFiles] = useState<File[]>([]);
	const [isUploadingImages, setIsUploadingImages] = useState(false);
	const [isSuccess, setIsSuccess] = useState(false);

	// Pre-fill images state for previews
	const [existingImagesView, setExistingImagesView] = useState<{ id?: string, url: string, type: string, file?: File }[]>(
		product?.images?.map(img => ({
			id: String(img.id),
			url: img.path || img.content || "",
			type: "image/existing"
		})) ?? []
	);

	const form = useForm<any>({
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

	const {
		register,
		handleSubmit,
		control,
		reset,
		watch,
		setValue,
		setError,
		formState: { errors, isSubmitting }
	} = form;

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

			setValue("slug", generatedSlug, { shouldValidate: true });
		}
	}, [nameValue, setValue]);

	// Reset form when product changes
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

	const createProductMutation = useMutation({
		mutationFn: (payload: CreateProductPayload) =>
			isEditMode
				? productService.updateProduct(String(product!.id), payload)
				: productService.createProduct(payload),
		onSuccess: () => {
			setIsSuccess(true);
			toast.success(isEditMode ? "Produto atualizado com sucesso!" : "Produto criado com sucesso!");

			queryClient.invalidateQueries({ queryKey: ["products"] });
			if (isEditMode) {
				queryClient.invalidateQueries({ queryKey: ["product", String(product!.id)] });
			}

			// Timing delay to let the dialog close before clearing states
			setTimeout(() => {
				reset();
				setSelectedFiles([]);
				setExistingImagesView([]);
				setIsSuccess(false);
			}, 500);

			if (onSuccess) {
				onSuccess();
			}
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

		// Upload das NOVAS Imagens (se houver) e montagem do array final respeitando a ORDEM do UI
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

		// Cálculo do Preço Final Absoluto
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

	const onFormError = (errs: any) => {
		console.error("❌ ERRO DE VALIDAÇÃO LOCAL:", errs);

		const errorFields = Object.keys(errs).join(", ");
		toast.error(`Campos inválidos: ${errorFields}. Verifique o console (F12) para detalhes.`);
	};

	return {
		// Form controls
		register,
		handleSubmit,
		control,
		reset,
		watch,
		setValue,
		setError,
		errors,
		isSubmitting,

		// Option fields
		optionFields,
		appendOption,
		removeOption,

		// Pricing
		calculatedDiscountPrice,

		// Image handling
		selectedFiles,
		setSelectedFiles,
		existingImagesView,
		setExistingImagesView,
		isUploadingImages,

		// Mutation
		createProductMutation,
		isSuccess,

		// Handlers
		onSubmit,
		onFormError,
	};
}