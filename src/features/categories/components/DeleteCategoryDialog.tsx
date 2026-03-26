import * as AlertDialog from "@radix-ui/react-alert-dialog";

interface DeleteCategoryDialogProps {
	open: boolean;
	onOpenChange: (open: boolean) => void;
	categoryName: string | null;
	onConfirm: () => void;
	isDeleting: boolean;
}

export function DeleteCategoryDialog({
	open,
	onOpenChange,
	categoryName,
	onConfirm,
	isDeleting,
}: DeleteCategoryDialogProps) {
	return (
		<AlertDialog.Root open={open} onOpenChange={onOpenChange}>
			<AlertDialog.Portal>
				<AlertDialog.Overlay className="data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0 fixed inset-0 z-50 bg-black/50" />
				<AlertDialog.Content className="data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0 data-[state=closed]:zoom-out-95 data-[state=open]:zoom-in-95 data-[state=closed]:slide-out-to-left-1/2 data-[state=closed]:slide-out-to-top-[48%] data-[state=open]:slide-in-from-left-1/2 data-[state=open]:slide-in-from-top-[48%] fixed left-[50%] top-[50%] z-50 grid w-full max-w-lg translate-x-[-50%] translate-y-[-50%] gap-4 border border-gray-200 bg-white p-6 shadow-lg duration-200 sm:rounded-lg">
					<AlertDialog.Title className="text-lg font-semibold text-gray-900">
						Excluir categoria
					</AlertDialog.Title>
					<AlertDialog.Description className="text-sm text-gray-500">
						Tem certeza que deseja excluir a categoria{" "}
						<span className="font-semibold text-gray-700">"{categoryName}"</span>? Esta ação não pode ser desfeita.
					</AlertDialog.Description>
					<div className="flex flex-col-reverse sm:flex-row sm:justify-end sm:space-x-2">
						<AlertDialog.Cancel asChild>
							<button className="mt-2 sm:mt-0 px-4 py-2 border border-gray-300 rounded-md bg-white text-gray-700 hover:bg-gray-50 font-medium text-sm transition-colors">
								Cancelar
							</button>
						</AlertDialog.Cancel>
						<AlertDialog.Action asChild>
							<button
								onClick={onConfirm}
								disabled={isDeleting}
								className="px-4 py-2 rounded-md bg-error text-white hover:bg-red-700 font-medium text-sm transition-colors disabled:opacity-50"
							>
								{isDeleting ? "Excluindo..." : "Excluir"}
							</button>
						</AlertDialog.Action>
					</div>
				</AlertDialog.Content>
			</AlertDialog.Portal>
		</AlertDialog.Root>
	);
}
