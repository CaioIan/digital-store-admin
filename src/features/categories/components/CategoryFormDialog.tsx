import { zodResolver } from "@hookform/resolvers/zod";
import * as Dialog from "@radix-ui/react-dialog";
import { Loader2, X } from "lucide-react";
import { useEffect } from "react";
import { useForm } from "react-hook-form";
import type { Category } from "../types/category";
import { categorySchema, type CategoryFormValues } from "../schemas/CategorySchema";

interface CategoryFormDialogProps {
	open: boolean;
	onOpenChange: (open: boolean) => void;
	category?: Category;
	onSubmit: (data: CategoryFormValues, categoryId?: string) => Promise<void>;
	isSubmitting: boolean;
}

export function CategoryFormDialog({
	open,
	onOpenChange,
	category,
	onSubmit,
	isSubmitting,
}: CategoryFormDialogProps) {
	const isEditMode = !!category;
	const {
		register,
		handleSubmit,
		setValue,
		watch,
		reset,
		formState: { errors },
	} = useForm<CategoryFormValues>({
		resolver: zodResolver(categorySchema),
		defaultValues: {
			name: category?.name ?? "",
			slug: category?.slug ?? "",
			use_in_menu: category?.use_in_menu ?? false,
		},
	});

	const nameValue = watch("name");

	useEffect(() => {
		if (!open) {
			return;
		}

		reset({
			name: category?.name ?? "",
			slug: category?.slug ?? "",
			use_in_menu: category?.use_in_menu ?? false,
		});
	}, [category, open, reset]);

	useEffect(() => {
		if (isEditMode || !nameValue) {
			return;
		}

		const generatedSlug = nameValue
			.toLowerCase()
			.trim()
			.normalize("NFD")
			.replace(/[\u0300-\u036f]/g, "")
			.replace(/[^a-z0-9]+/g, "-")
			.replace(/^-+|-+$/g, "")
			.slice(0, 50);

		setValue("slug", generatedSlug, { shouldValidate: true });
	}, [isEditMode, nameValue, setValue]);

	const handleFormSubmit = async (data: CategoryFormValues) => {
		await onSubmit(data, category?.id);
	};

	return (
		<Dialog.Root open={open} onOpenChange={onOpenChange}>
			<Dialog.Portal>
				<Dialog.Overlay className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0" />
				<Dialog.Content className="fixed left-[50%] top-[50%] z-50 w-full max-w-xl translate-x-[-50%] translate-y-[-50%] border-none bg-white p-0 shadow-2xl duration-200 data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0 data-[state=closed]:zoom-out-95 data-[state=open]:zoom-in-95 data-[state=closed]:slide-out-to-left-1/2 data-[state=closed]:slide-out-to-top-[48%] data-[state=open]:slide-in-from-left-1/2 data-[state=open]:slide-in-from-top-[48%] sm:rounded-3xl">
					<div className="bg-white p-8 space-y-6">
						<div className="flex items-start justify-between">
							<div className="space-y-1">
								<Dialog.Title className="text-2xl font-black text-gray-900 tracking-tight">
									{isEditMode ? "Editar Categoria" : "Nova Categoria"}
								</Dialog.Title>
								<Dialog.Description className="text-gray-500 font-medium">
									{isEditMode
										? "Atualize os dados da categoria selecionada."
										: "Cadastre uma nova categoria para organizar o catálogo."}
								</Dialog.Description>
							</div>
							<button
								onClick={() => onOpenChange(false)}
								className="p-2 hover:bg-gray-100 rounded-xl transition-all group"
							>
								<X className="w-5 h-5 text-gray-400 group-hover:text-gray-900" />
							</button>
						</div>

						<form
							onSubmit={handleSubmit(handleFormSubmit)}
							className="space-y-6"
						>
							<div className="space-y-2">
								<label
									htmlFor="category-name"
									className="text-sm font-semibold text-gray-700"
								>
									Nome
								</label>
								<input
									id="category-name"
									type="text"
									placeholder="Ex: Eletrônicos"
									{...register("name")}
									className="w-full px-4 py-3 border border-gray-300 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary"
								/>
								{errors.name && (
									<p className="text-xs text-error">{errors.name.message}</p>
								)}
							</div>

							<div className="space-y-2">
								<label
									htmlFor="category-slug"
									className="text-sm font-semibold text-gray-700"
								>
									Slug
								</label>
								<input
									id="category-slug"
									type="text"
									placeholder="Ex: eletronicos"
									{...register("slug")}
									className="w-full px-4 py-3 border border-gray-300 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary"
								/>
								{errors.slug && (
									<p className="text-xs text-error">{errors.slug.message}</p>
								)}
							</div>

							<label className="flex items-center gap-3 p-4 border border-gray-200 rounded-xl bg-gray-50 cursor-pointer">
								<input
									type="checkbox"
									{...register("use_in_menu")}
									className="h-4 w-4 rounded border-gray-300 text-primary focus:ring-primary"
								/>
								<div className="text-sm">
									<p className="font-semibold text-gray-800">Exibir no menu</p>
									<p className="text-gray-500">
										Categorias marcadas podem ser usadas na navegação principal.
									</p>
								</div>
							</label>

							<div className="flex justify-end gap-3 pt-2">
								<button
									type="button"
									onClick={() => onOpenChange(false)}
									className="px-5 py-2.5 rounded-xl text-gray-600 font-semibold hover:bg-gray-100 transition-colors"
								>
									Cancelar
								</button>
								<button
									type="submit"
									disabled={isSubmitting}
									className="px-6 py-2.5 rounded-xl bg-primary text-white font-bold hover:bg-tertiary transition-colors disabled:opacity-60 disabled:cursor-not-allowed flex items-center gap-2"
								>
									{isSubmitting && <Loader2 className="w-4 h-4 animate-spin" />}
									{isEditMode ? "Salvar Alterações" : "Cadastrar Categoria"}
								</button>
							</div>
						</form>
					</div>
				</Dialog.Content>
			</Dialog.Portal>
		</Dialog.Root>
	);
}
