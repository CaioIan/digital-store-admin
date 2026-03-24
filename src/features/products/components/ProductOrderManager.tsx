import {
	DndContext,
	type DragEndEvent,
	KeyboardSensor,
	PointerSensor,
	closestCenter,
	useSensor,
	useSensors,
} from "@dnd-kit/core";
import {
	SortableContext,
	sortableKeyboardCoordinates,
	useSortable,
	verticalListSortingStrategy,
} from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { ArrowDown, ArrowUp, GripVertical, Loader2 } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import type { Product, ProductOrderItem } from "../types/product";

interface ProductOrderManagerProps {
	products: Product[];
	onSave: (items: ProductOrderItem[]) => void;
	onCancel: () => void;
	isSaving: boolean;
}

function SortableRow({
	product,
	index,
	total,
	onMove,
	isSaving,
	highlightedId,
}: {
	product: Product;
	index: number;
	total: number;
	onMove: (index: number, direction: "up" | "down") => void;
	isSaving: boolean;
	highlightedId: number | null;
}) {
	const {
		attributes,
		listeners,
		setNodeRef,
		transform,
		transition,
		isDragging,
	} = useSortable({ id: product.id });

	const style = {
		transform: CSS.Transform.toString(transform),
		transition: transition ?? undefined,
	};

	const isHighlighted = highlightedId === product.id;

	return (
		<tr
			ref={setNodeRef}
			style={style}
			className={`transition-colors ${
				isDragging
					? "bg-primary/5 shadow-lg opacity-90 relative z-10"
					: isHighlighted
						? "bg-amber-50"
						: "hover:bg-gray-50"
			}`}
		>
			<td className="px-3 py-4 text-center w-10">
				<button
					type="button"
					{...attributes}
					{...listeners}
					className="cursor-grab active:cursor-grabbing p-1 text-gray-400 hover:text-gray-600 touch-none"
					title="Arrastar para reordenar"
				>
					<GripVertical className="w-5 h-5" />
				</button>
			</td>
			<td className="px-4 py-4 text-center text-xs font-bold text-gray-400 w-12">
				{index + 1}
			</td>
			<td className="px-4 py-4 font-medium text-gray-900">
				<div className="flex items-center gap-3">
					{product.images && product.images.length > 0 ? (
						<img
							src={product.images[0].path || product.images[0].content}
							alt={product.name}
							className="w-10 h-10 rounded object-cover bg-gray-100 shrink-0"
						/>
					) : (
						<div className="w-10 h-10 rounded bg-gray-200 flex items-center justify-center text-gray-400 shrink-0">
							<span className="text-xs">S/I</span>
						</div>
					)}
					<span className="truncate max-w-[300px]" title={product.name}>
						{product.name}
					</span>
				</div>
			</td>
			<td className="px-4 py-4 text-center">
				<span
					className={`inline-flex items-center rounded-full px-2.5 py-1 text-xs font-semibold ${
						product.enabled
							? "bg-green-100 text-green-800"
							: "bg-red-100 text-red-800"
					}`}
				>
					{product.enabled ? "Ativo" : "Inativo"}
				</span>
			</td>
			<td className="px-4 py-4">
				<div className="flex items-center justify-center gap-1">
					<button
						type="button"
						onClick={() => onMove(index, "up")}
						disabled={index === 0 || isSaving}
						className="p-1.5 hover:bg-primary/5 rounded-lg border border-gray-100 disabled:opacity-30 transition-all shadow-sm"
						title="Mover para cima"
					>
						<ArrowUp className="w-4 h-4" />
					</button>
					<button
						type="button"
						onClick={() => onMove(index, "down")}
						disabled={index === total - 1 || isSaving}
						className="p-1.5 hover:bg-primary/5 rounded-lg border border-gray-100 disabled:opacity-30 transition-all shadow-sm"
						title="Mover para baixo"
					>
						<ArrowDown className="w-4 h-4" />
					</button>
				</div>
			</td>
		</tr>
	);
}

export function ProductOrderManager({
	products,
	onSave,
	onCancel,
	isSaving,
}: ProductOrderManagerProps) {
	const [localProducts, setLocalProducts] = useState<Product[]>(products);
	const [isDirty, setIsDirty] = useState(false);
	const [highlightedId, setHighlightedId] = useState<number | null>(null);
	const highlightTimeout = useRef<ReturnType<typeof setTimeout>>(null);

	useEffect(() => {
		setLocalProducts(products);
		setIsDirty(false);
	}, [products]);

	useEffect(() => {
		return () => {
			if (highlightTimeout.current) clearTimeout(highlightTimeout.current);
		};
	}, []);

	const sensors = useSensors(
		useSensor(PointerSensor, { activationConstraint: { distance: 5 } }),
		useSensor(KeyboardSensor, {
			coordinateGetter: sortableKeyboardCoordinates,
		}),
	);

	const highlightItem = (id: number) => {
		if (highlightTimeout.current) clearTimeout(highlightTimeout.current);
		setHighlightedId(id);
		highlightTimeout.current = setTimeout(() => setHighlightedId(null), 600);
	};

	const moveProduct = (index: number, direction: "up" | "down") => {
		const newList = [...localProducts];
		const targetIndex = direction === "up" ? index - 1 : index + 1;
		if (targetIndex >= 0 && targetIndex < newList.length) {
			const movedItem = newList[index];
			[newList[index], newList[targetIndex]] = [
				newList[targetIndex],
				newList[index],
			];
			setLocalProducts(newList);
			setIsDirty(true);
			highlightItem(movedItem.id);
		}
	};

	const handleDragEnd = (event: DragEndEvent) => {
		const { active, over } = event;
		if (!over || active.id === over.id) return;

		const oldIndex = localProducts.findIndex((p) => p.id === active.id);
		const newIndex = localProducts.findIndex((p) => p.id === over.id);

		if (oldIndex === -1 || newIndex === -1) return;

		const newList = [...localProducts];
		const [moved] = newList.splice(oldIndex, 1);
		newList.splice(newIndex, 0, moved);

		setLocalProducts(newList);
		setIsDirty(true);
	};

	const handleSave = () => {
		const items = localProducts.map((product, index) => ({
			id: product.id,
			display_order: index + 1,
		}));
		onSave(items);
	};

	return (
		<div className="space-y-4">
			<div className="flex items-center justify-between bg-amber-50 border border-amber-200 rounded-lg px-4 py-3">
				<p className="text-sm text-amber-800 font-medium">
					Modo de ordenacao ativo — arraste os produtos ou use as setas para
					reordenar, depois clique em "Salvar Ordem".
				</p>
				<div className="flex items-center gap-2 shrink-0 ml-4">
					<button
						type="button"
						onClick={onCancel}
						disabled={isSaving}
						className="border border-gray-300 text-gray-700 hover:bg-gray-50 transition-colors px-4 py-2 rounded-md font-medium text-sm disabled:opacity-50"
					>
						Cancelar
					</button>
					<button
						type="button"
						onClick={handleSave}
						disabled={!isDirty || isSaving}
						className="bg-primary text-white hover:bg-tertiary transition-colors px-4 py-2 rounded-md font-medium text-sm disabled:opacity-50 flex items-center gap-2"
					>
						{isSaving && <Loader2 className="w-4 h-4 animate-spin" />}
						Salvar Ordem
					</button>
				</div>
			</div>

			<div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
				<DndContext
					sensors={sensors}
					collisionDetection={closestCenter}
					onDragEnd={handleDragEnd}
				>
					<table className="w-full text-left text-sm text-gray-700">
						<thead className="bg-gray-50 text-gray-900 border-b border-gray-200 uppercase">
							<tr>
								<th scope="col" className="px-3 py-4 font-medium w-10" />
								<th
									scope="col"
									className="px-4 py-4 font-medium text-center w-12"
								>
									#
								</th>
								<th scope="col" className="px-4 py-4 font-medium">
									Nome do Produto
								</th>
								<th
									scope="col"
									className="px-4 py-4 font-medium text-center"
								>
									Status
								</th>
								<th
									scope="col"
									className="px-4 py-4 font-medium text-center w-28"
								>
									Ordem
								</th>
							</tr>
						</thead>
						<SortableContext
							items={localProducts.map((p) => p.id)}
							strategy={verticalListSortingStrategy}
						>
							<tbody className="divide-y divide-gray-200">
								{localProducts.map((product, index) => (
									<SortableRow
										key={product.id}
										product={product}
										index={index}
										total={localProducts.length}
										onMove={moveProduct}
										isSaving={isSaving}
										highlightedId={highlightedId}
									/>
								))}
							</tbody>
						</SortableContext>
					</table>
				</DndContext>
			</div>
		</div>
	);
}
