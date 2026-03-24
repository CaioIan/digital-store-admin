import { z } from "zod";

export const productSchema = z.object({
	name: z.string().min(3, "O nome deve ter pelo menos 3 caracteres").max(100),
	slug: z.string().min(3, "Slug deve ter pelo menos 3 caracteres").max(100),
	description: z.string().min(10, "A descrição deve ter pelo menos 10 caracteres").max(1000),

	price: z.coerce
		.number()
		.min(0.01, "O preço base deve ser maior que zero (R$ 0,01)"),
	priceWithDiscount: z.coerce
		.number()
		.min(0, "O desconto não pode ser negativo")
		.max(100, "O desconto não pode ser superior a 100%")
		.optional()
		.refine(
			(val) => val === undefined || isNaN(val) || (val >= 0 && val <= 100),
			"O desconto deve ser uma porcentagem válida entre 0% e 100%",
		),

	enabled: z.boolean().default(true),
	useInMenu: z.boolean().default(false),
	stock: z.coerce.number().int().min(0, "O estoque não pode ser negativo").default(0),
	brand: z.string().min(1, "A marca é obrigatória").max(100).optional().or(z.literal("")),
	gender: z.enum(["Masculino", "Feminino", "Unisex"]).optional(),

	categoryIds: z.array(z.string().uuid("Selecione uma categoria válida")).min(1, "Selecione pelo menos uma categoria"),

	images: z
		.array(
			z.object({
				type: z.string(),
				content: z.string().url("URL de imagem inválida"),
			}),
		)
		.min(1, "Adicione pelo menos uma imagem"),

	options: z
		.array(
			z.object({
				title: z.string().min(1, "Título é obrigatório").max(30),
				shape: z.enum(["square", "circle"]).default("square"),
				type: z.enum(["text", "color"]).default("text"),
				values: z.preprocess(
					(val) => (typeof val === "string" ? val.split(",").map((v) => v.trim()).filter(Boolean) : val),
					z.array(z.string()).min(1, "Adicione pelo menos um valor")
				),
			}),
		)
		.default([]),
});

export type ProductFormData = z.infer<typeof productSchema>;
