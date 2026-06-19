import { z } from 'zod';

// Individual record schemas for Gemini output validation

export const CustomerSchema = z.object({
  name: z.string().min(1),
  phone: z.string().nullable().optional(),
  amount_owed: z.number().min(0).default(0),
  last_order: z.string().nullable().optional(),
  status: z.enum(['active', 'inactive', 'pending']).default('active'),
});

export const OrderSchema = z.object({
  order_id: z.string().nullable().optional(),
  customer_name: z.string().min(1),
  item: z.string().min(1),
  quantity: z.number().min(0).default(1),
  due_date: z.string().nullable().optional(),
  status: z.enum(['pending', 'completed', 'overdue']).default('pending'),
});

export const SupplierSchema = z.object({
  supplier_name: z.string().min(1),
  item: z.string().min(1),
  unit_price: z.number().min(0),
  lead_time: z.string().nullable().optional(),
});

export const FollowUpSchema = z.object({
  type: z.enum(['payment', 'order', 'customer', 'supplier']),
  title: z.string().min(1),
  description: z.string().nullable().optional(),
  due_date: z.string().nullable().optional(),
  status: z.enum(['pending', 'done']).default('pending'),
});

// Gemini structuring response — all arrays default to empty
export const GeminiResponseSchema = z.object({
  customers: z.array(CustomerSchema).default([]),
  orders: z.array(OrderSchema).default([]),
  suppliers: z.array(SupplierSchema).default([]),
  follow_ups: z.array(FollowUpSchema).default([]),
});

// API request schemas

export const StructureRequestSchema = z.object({
  document_id: z.string().uuid(),
});

export const ChatRequestSchema = z.object({
  question: z.string().min(1).max(500),
});

export const SearchRequestSchema = z.object({
  q: z.string().min(2).max(100),
});

export const DemoDataRequestSchema = z.object({
  clear_existing: z.boolean().default(true),
});

// Gemini query intent validation
export const QueryIntentSchema = z.object({
  intent: z.enum(['query', 'off_topic']),
  table: z.enum(['customers', 'orders', 'suppliers', 'follow_ups', 'documents']).optional(),
  filters: z.record(z.union([z.string(), z.number(), z.boolean()])).optional(),
  order_by: z.string().optional(),
  direction: z.enum(['asc', 'desc']).optional(),
  limit: z.number().min(1).max(100).default(20).optional(),
});

// Export inferred types
export type CustomerInput = z.infer<typeof CustomerSchema>;
export type OrderInput = z.infer<typeof OrderSchema>;
export type SupplierInput = z.infer<typeof SupplierSchema>;
export type FollowUpInput = z.infer<typeof FollowUpSchema>;
export type GeminiResponse = z.infer<typeof GeminiResponseSchema>;
export type QueryIntent = z.infer<typeof QueryIntentSchema>;
