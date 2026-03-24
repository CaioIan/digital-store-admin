import { ArrowDown, ArrowUp, ImageIcon, Trash2, Upload } from "lucide-react";
import type { FieldErrors, UseFormSetValue } from "react-hook-form";

interface ProductImageUploadProps {
	existingImagesView: { id?: string, url: string, type: string, file?: File }[];
	setExistingImagesView: (images: { id?: string, url: string, type: string, file?: File }[]) => void;
	selectedFiles: File[];
	setSelectedFiles: (files: File[]) => void;
	setValue: UseFormSetValue<any>;
	errors: FieldErrors<any>;
}

export function ProductImageUpload({
	existingImagesView,
	setExistingImagesView,
	selectedFiles,
	setSelectedFiles,
	setValue,
	errors,
}: ProductImageUploadProps) {

	const handleFileSelect = (files: FileList | null) => {
		if (!files) return;
		const newFiles = Array.from(files);
		setSelectedFiles([...selectedFiles, ...newFiles]);

		const newPreviewItems = newFiles.map(f => {
			const blobUrl = URL.createObjectURL(f);
			return { id: blobUrl, url: blobUrl, type: f.type, file: f };
		});
		setExistingImagesView([...existingImagesView, ...newPreviewItems]);

		// Atualiza o estado do formulário para passar na validação do Zod
		const allImagesForValidation = [...existingImagesView, ...newPreviewItems];
		setValue("images", allImagesForValidation.map(img => ({ type: img.type, content: img.url })), { shouldValidate: true });
	};

	const removeSelectedFile = (index: number) => {
		const imgToRemove = existingImagesView[index];

		if (imgToRemove.type !== "image/existing" && imgToRemove.file) {
			setSelectedFiles(selectedFiles.filter(f => f !== imgToRemove.file));
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

	return (
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
	);
}