-- Supabase Schema for Kitchen Dashboard

-- We assume the `organizations` and `profiles` tables already exist based on your auth setup.

-- 1. Inventory Items Table
CREATE TABLE inventory_items (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    quantity NUMERIC NOT NULL DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 2. Menu Items Table
CREATE TABLE menu_items (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    price NUMERIC NOT NULL DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 3. Menu Ingredients (Join Table: maps inventory to menu items)
CREATE TABLE menu_ingredients (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    menu_item_id UUID NOT NULL REFERENCES menu_items(id) ON DELETE CASCADE,
    inventory_item_id UUID NOT NULL REFERENCES inventory_items(id) ON DELETE CASCADE,
    quantity NUMERIC NOT NULL DEFAULT 1, -- Quantity of inventory needed for this menu item
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 4. Orders Table
CREATE TABLE orders (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
    customer_name TEXT NOT NULL,
    discount NUMERIC NOT NULL DEFAULT 0,
    total NUMERIC NOT NULL DEFAULT 0,
    status TEXT NOT NULL DEFAULT 'Completed', -- e.g. Pending, Completed, Cancelled
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 5. Order Items Table
CREATE TABLE order_items (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    order_id UUID NOT NULL REFERENCES orders(id) ON DELETE CASCADE,
    menu_item_id UUID NOT NULL REFERENCES menu_items(id) ON DELETE CASCADE,
    quantity NUMERIC NOT NULL DEFAULT 1,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 6. Expenses Table
CREATE TABLE expenses (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
    description TEXT NOT NULL,
    amount NUMERIC NOT NULL,
    category TEXT NOT NULL,
    date TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);


-- ROW LEVEL SECURITY (RLS)
-- Enable RLS for all new tables
ALTER TABLE inventory_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE menu_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE menu_ingredients ENABLE ROW LEVEL SECURITY;
ALTER TABLE orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE order_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE expenses ENABLE ROW LEVEL SECURITY;

-- Helper function to get current user's organization (if not already existing)
-- CREATE OR REPLACE FUNCTION auth.user_organization_id()
-- RETURNS UUID AS $$
--   SELECT organization_id FROM public.profiles WHERE id = auth.uid();
-- $$ LANGUAGE sql STABLE;

-- RLS Policies
-- Users can only view and manage data belonging to their organization
-- We use a direct query for simplicity, assuming `profiles` has an `organization_id` column.

-- Inventory Items Policies
CREATE POLICY "Users can manage their organization's inventory"
ON inventory_items FOR ALL
USING (organization_id IN (SELECT organization_id FROM profiles WHERE id = auth.uid()))
WITH CHECK (organization_id IN (SELECT organization_id FROM profiles WHERE id = auth.uid()));

-- Menu Items Policies
CREATE POLICY "Users can manage their organization's menu items"
ON menu_items FOR ALL
USING (organization_id IN (SELECT organization_id FROM profiles WHERE id = auth.uid()))
WITH CHECK (organization_id IN (SELECT organization_id FROM profiles WHERE id = auth.uid()));

-- Menu Ingredients Policies
-- (Inherits security through the related menu item's organization indirectly, 
-- but we can explicitly check via joining menu_items)
CREATE POLICY "Users can manage their organization's menu ingredients"
ON menu_ingredients FOR ALL
USING (
    menu_item_id IN (
        SELECT id FROM menu_items WHERE organization_id IN (
            SELECT organization_id FROM profiles WHERE id = auth.uid()
        )
    )
)
WITH CHECK (
    menu_item_id IN (
        SELECT id FROM menu_items WHERE organization_id IN (
            SELECT organization_id FROM profiles WHERE id = auth.uid()
        )
    )
);

-- Orders Policies
CREATE POLICY "Users can manage their organization's orders"
ON orders FOR ALL
USING (organization_id IN (SELECT organization_id FROM profiles WHERE id = auth.uid()))
WITH CHECK (organization_id IN (SELECT organization_id FROM profiles WHERE id = auth.uid()));

-- Order Items Policies
CREATE POLICY "Users can manage their organization's order items"
ON order_items FOR ALL
USING (
    order_id IN (
        SELECT id FROM orders WHERE organization_id IN (
            SELECT organization_id FROM profiles WHERE id = auth.uid()
        )
    )
)
WITH CHECK (
    order_id IN (
        SELECT id FROM orders WHERE organization_id IN (
            SELECT organization_id FROM profiles WHERE id = auth.uid()
        )
    )
);

-- Expenses Policies
CREATE POLICY "Users can manage their organization's expenses"
ON expenses FOR ALL
USING (organization_id IN (SELECT organization_id FROM profiles WHERE id = auth.uid()))
WITH CHECK (organization_id IN (SELECT organization_id FROM profiles WHERE id = auth.uid()));
