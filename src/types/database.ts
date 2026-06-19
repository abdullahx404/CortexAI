// TypeScript types matching the Supabase database schema
// Keep these in sync with 4_database-schema.md

export interface Document {
  id: string;
  file_name: string;
  file_type: 'csv' | 'xlsx' | 'xls' | 'txt' | 'pdf' | 'jpg' | 'jpeg' | 'png';
  raw_text: string | null;
  structured: boolean;
  created_at: string;
}

export interface Customer {
  id: string;
  name: string;
  phone: string | null;
  amount_owed: number;
  last_order: string | null; // ISO date string YYYY-MM-DD
  status: 'active' | 'inactive' | 'pending';
  created_at: string;
}

export interface Order {
  id: string;
  order_id: string | null;
  customer_name: string;
  item: string;
  quantity: number;
  due_date: string | null; // ISO date string YYYY-MM-DD
  status: 'pending' | 'completed' | 'overdue';
  created_at: string;
}

export interface Supplier {
  id: string;
  supplier_name: string;
  item: string;
  unit_price: number;
  lead_time: string | null;
  created_at: string;
}

export interface FollowUp {
  id: string;
  type: 'payment' | 'order' | 'customer' | 'supplier';
  title: string;
  description: string | null;
  due_date: string | null; // ISO date string YYYY-MM-DD
  status: 'pending' | 'done';
  created_at: string;
}

// Gemini structuring response shape
export interface GeminiStructuredData {
  customers: Omit<Customer, 'id' | 'created_at'>[];
  orders: Omit<Order, 'id' | 'created_at'>[];
  suppliers: Omit<Supplier, 'id' | 'created_at'>[];
  follow_ups: Omit<FollowUp, 'id' | 'created_at'>[];
}

// Dashboard summary type
export interface DashboardSummary {
  total_pending_payments: number;
  overdue_orders_count: number;
  active_customers_count: number;
  todays_followups_count: number;
}

// Search results type
export interface SearchResults {
  query: string;
  results: {
    customers: Customer[];
    orders: Order[];
    suppliers: Supplier[];
    follow_ups: FollowUp[];
    documents: Document[];
  };
  total: number;
}

// Chat response type
export interface ChatResponse {
  answer: string;
  table_used: string;
  record_count: number;
}

// Gemini query intent (from chatbot)
export interface QueryIntent {
  intent: 'query' | 'off_topic';
  table?: 'customers' | 'orders' | 'suppliers' | 'follow_ups' | 'documents';
  filters?: Record<string, string | number | boolean>;
  order_by?: string;
  direction?: 'asc' | 'desc';
  limit?: number;
}
