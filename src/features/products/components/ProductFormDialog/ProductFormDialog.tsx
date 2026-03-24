import * as Dialog from "@radix-ui/react-dialog";
import { Loader2, X } from "lucide-react";
import type { Product } from "../../types/product";
import { useProductForm } from "../../hooks/useProductForm";
import { ProductFormFields } from "./ProductFormFields";
import { ProductImageUpload } from "./ProductImageUpload";
import { ProductOptionsManager } from "./ProductOptionsManager";

interface ProductFormDialogProps {
	open: boolean;
	onOpenChange: (open: boolean) => void;
	product?: Product;
}

export function ProductFormDialog({ open, onOpenChange, product }: ProductFormDialogProps) {
	const isEditMode = !!product;

	const {
		register,
		handleSubmit,
		errors,
		isSubmitting,
		optionFields,
		appendOption,
		removeOption,
		calculatedDiscountPrice,
		selectedFiles,
		setSelectedFiles,
		existingImagesView,
		setExistingImagesView,
		isUploadingImages,
		createProductMutation,
		isSuccess,
		setValue,
		onSubmit,
		onFormError,
	} = useProductForm({
		product,
		onSuccess: () => onOpenChange(false),
		isEditMode,
	});

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
									<ProductFormFields register={register} errors={errors} />
									<ProductImageUpload
										existingImagesView={existingImagesView}
										setExistingImagesView={setExistingImagesView}
										selectedFiles={selectedFiles}
										setSelectedFiles={setSelectedFiles}
										setValue={setValue}
										errors={errors}
									/>
								</div>

								{/* Coluna Direita: Preços, Opções e Categorias */}
								<ProductOptionsManager
									register={register}
									errors={errors}
									setValue={setValue}
									optionFields={optionFields}
									appendOption={appendOption}
									removeOption={removeOption}
									calculatedDiscountPrice={calculatedDiscountPrice}
								/>
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