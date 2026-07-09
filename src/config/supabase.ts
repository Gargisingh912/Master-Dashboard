import { createClient } from "@supabase/supabase-js";
import { SUPABASE_URL, SUPABASE_ANON_KEY } from "./config";

// Initialize Supabase client
export const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
  auth: {
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: true,
  },
});

// Database types
export interface Organization {
  id: string;
  organization_name: string;
  owner_name: string;
  phone: string;
  email?: string;
  city: string;
  address?: string;
  organization_type: string;
  heard_from?: string;
  notes?: string;
  status: "pending" | "contacted" | "verified" | "rejected";
  contacted_at?: string;
  rejection_reason?: string;
  internal_notes?: string;
  created_at: string;
}

export interface RegistrationRequest {
  id: string;
  restaurant_name: string;
  owner_name: string;
  phone: string;
  email?: string;
  city: string;
  address?: string;
  restaurant_type?: string;
  heard_from?: string;
  notes?: string;
  status: "pending" | "contacted" | "verified" | "rejected";
  contacted_at?: string;
  rejection_reason?: string;
  internal_notes?: string;
  created_at: string;
}

export interface Restaurant {
  id: string;
  registration_request_id?: string;
  name: string;
  slug: string;
  owner_name?: string;
  phone: string;
  email: string;
  city?: string;
  address?: string;
  restaurant_type?: string;
  logo_url?: string;
  qr_code_url?: string;
  subscription_plan: "free_trial" | "starter" | "pro" | "enterprise";
  status: "active" | "blocked" | "trial";
  is_active: boolean;
  internal_notes?: string;
  block_reason?: string;
  trial_ends_at?: string;
  created_at: string;
  updated_at: string;
}

// Inherits everything from Restaurant to avoid duplicate code
export interface Kitchen extends Restaurant {}

export interface User {
  id: string; // Should map directly to auth.users.id in Supabase
  restaurant_id?: string;
  email: string;
  role: "owner" | "staff";
  created_at: string;
}

export interface MenuItem {
  id: string;
  restaurant_id: string;
  name: string;
  description?: string;
  base_price: number;
  category?: string;
  image_url?: string;
  is_available: boolean;
  sizes?: { name: string; price: number }[];
  addons?: { name: string; price: number }[];
  created_at: string;
}

export interface Order {
  id: string;
  restaurant_id: string;
  order_number: string;
  order_type: "qr" | "counter" | "phone" | "table";
  table_number?: string;
  customer_name?: string;
  customer_phone?: string;
  items: OrderItem[]; // Assumes items are stored in a JSONB column on the orders table
  subtotal: number;
  tax: number;
  discount?: number;
  total: number;
  status:
    | "pending"
    | "accepted"
    | "preparing"
    | "ready"
    | "completed"
    | "cancelled"
    | "rejected";
  payment_method?: string;
  payment_status?: string;
  payment_transaction_id?: string;
  customer_notes?: string;
  internal_notes?: string;
  accepted_at?: string;
  preparing_at?: string;
  ready_at?: string;
  completed_at?: string;
  cancelled_at?: string;
  created_at: string;
  updated_at?: string;
}

export interface OrderItem {
  menu_item_id: string;
  name: string;
  quantity: number;
  base_price: number;
  selected_size?: { name: string; price: number };
  selected_addons?: { name: string; price: number }[];
  item_total: number;
  special_instructions?: string;
}

export interface AdminUser {
  id: string; // Should map directly to auth.users.id in Supabase
  email: string;
  name?: string;
  created_at: string;
}

// --- New Database Row Interfaces (Matching schema.sql) ---

export interface InventoryItemRow {
  id: string;
  organization_id: string;
  name: string;
  quantity: number;
  created_at: string;
  updated_at: string;
}

export interface MenuItemRow {
  id: string;
  organization_id: string;
  name: string;
  price: number;
  created_at: string;
  updated_at: string;
}

export interface MenuIngredientRow {
  id: string;
  menu_item_id: string;
  inventory_item_id: string;
  quantity: number;
  created_at: string;
}

export interface OrderRow {
  id: string;
  organization_id: string;
  customer_name: string;
  discount: number;
  total: number;
  status: string;
  created_at: string;
}

export interface OrderItemRow {
  id: string;
  order_id: string;
  menu_item_id: string;
  quantity: number;
  created_at: string;
}

export interface ExpenseRow {
  id: string;
  organization_id: string;
  description: string;
  amount: number;
  category: string;
  date: string;
  created_at: string;
}
