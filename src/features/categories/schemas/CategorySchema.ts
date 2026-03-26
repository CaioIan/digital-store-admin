import { z } from "zod";

export const categorySchema = z.object({
	name: z
		.string()
		.trim()
		.min(1, "O nome é obrigatório")
		.max(50, "O nome deve ter no máximo 50 caracteres"),
	slug: z
		.string()
		.trim()
		.min(1, "O slug é obrigatório")
		.max(50, "O slug deve ter no máximo 50 caracteres")
		.regex(/^[a-z0-9-]+$/, "Use apenas letras minúsculas, números e hífen"),
	use_in_menu: z.boolean(),
});

export type CategoryFormValues = z.infer<typeof categorySchema>;
