import { z } from "zod";

export const userSchema = z.object({
	id: z.string().uuid(),
	firstname: z.string(),
	surname: z.string(),
	email: z.string(),
	cpf: z.string().optional().nullable(),
	phone: z.string().optional().nullable(),
	role: z.enum(["USER", "ADMIN"]),
	created_at: z.string(),
});

export const userListResponseSchema = z.object({
	data: z.array(userSchema),
	total: z.number(),
	limit: z.number(),
	page: z.number(),
});

export type User = z.infer<typeof userSchema>;
export type UserListResponse = z.infer<typeof userListResponseSchema>;
