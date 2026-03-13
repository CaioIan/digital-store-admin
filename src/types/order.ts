import { z } from "zod";

export const orderItemSchema = z.object({
	product_id: z.string().uuid(),
	product_name: z.string(),
	image_url: z.string().url(),
	quantity: z.number().int().positive(),
	price_at_purchase: z.number().nonnegative(),
});

export const orderSchema = z.object({
	id: z.string().uuid(),
	status: z.enum(["pending", "completed", "cancelled", "shipped", "delivered"]),
	created_at: z.string().datetime(),
	total: z.number().nonnegative(),
	client: z.object({
		name: z.string(),
		email: z.string(),
		cpf: z.string().optional(),
		phone: z.string().optional(),
	}).optional().nullable(),
	address: z.object({
		street: z.string(),
		neighborhood: z.string().optional(),
		city: z.string(),
		cep: z.string().optional(),
		complement: z.string().optional(),
	}).optional().nullable(),
	items: z.array(orderItemSchema),
});

export const orderListResponseSchema = z.object({
	data: z.array(orderSchema),
	total: z.number().int().nonnegative(),
	limit: z.number().int().nonnegative(),
	page: z.number().int().nonnegative(),
});

export type OrderItem = z.infer<typeof orderItemSchema>;
export type Order = z.infer<typeof orderSchema>;
export type OrderListResponse = z.infer<typeof orderListResponseSchema>;

export type OrderStatus = Order["status"];
