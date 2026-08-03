-- 1. Add diet_type column to menu_items (if not already done)
ALTER TABLE menu_items
ADD COLUMN IF NOT EXISTS diet_type TEXT CHECK (diet_type IN ('veg', 'nonveg', 'vegan'));

-- 2. Add notes & coupon columns to orders (if not already done)
ALTER TABLE orders
ADD COLUMN IF NOT EXISTS notes TEXT,
ADD COLUMN IF NOT EXISTS coupon_code TEXT,
ADD COLUMN IF NOT EXISTS coupon_discount NUMERIC DEFAULT 0;

-- 3. Create discount_coupons table
CREATE TABLE IF NOT EXISTS discount_coupons (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  code TEXT NOT NULL,
  discount_percent NUMERIC NOT NULL CHECK (discount_percent > 0 AND discount_percent <= 100),
  max_uses INTEGER,           -- NULL = unlimited
  used_count INTEGER NOT NULL DEFAULT 0,
  valid_from TIMESTAMPTZ NOT NULL DEFAULT now(),
  valid_to TIMESTAMPTZ,       -- NULL = never expires
  is_active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE (organization_id, code)
);

-- 4. RLS for discount_coupons
ALTER TABLE discount_coupons ENABLE ROW LEVEL SECURITY;

-- Dashboard users (authenticated via their org) can manage their coupons
CREATE POLICY "owners can manage their coupons"
ON discount_coupons
FOR ALL
USING (
  organization_id IN (
    SELECT organization_id FROM users WHERE id = auth.uid()
  )
);

-- Anonymous / public can READ coupons (to validate on QR order page)
CREATE POLICY "public can read active coupons"
ON discount_coupons
FOR SELECT
USING (is_active = true);

-- 5. RPC function to safely increment used_count (prevents race conditions)
CREATE OR REPLACE FUNCTION increment_coupon_usage(coupon_id UUID)
RETURNS void
LANGUAGE sql
SECURITY DEFINER
AS $$
  UPDATE discount_coupons
  SET used_count = used_count + 1
  WHERE id = coupon_id;
$$;

-- 6. Enable Supabase Realtime on all tables
--    REPLICA IDENTITY FULL ensures UPDATE/DELETE events include the full row,
--    which the dashboard's granular subscriptions depend on.

ALTER TABLE inventory_items REPLICA IDENTITY FULL;
ALTER TABLE menu_items REPLICA IDENTITY FULL;
ALTER TABLE menu_ingredients REPLICA IDENTITY FULL;
ALTER TABLE orders REPLICA IDENTITY FULL;
ALTER TABLE order_items REPLICA IDENTITY FULL;
ALTER TABLE expenses REPLICA IDENTITY FULL;
ALTER TABLE discount_coupons REPLICA IDENTITY FULL;

-- Add all tables to the supabase_realtime publication
-- (If the publication doesn't exist yet, Supabase creates it automatically
--  when you toggle Realtime ON in the dashboard. This is a safety net.)
DO $$
BEGIN
  IF EXISTS (SELECT 1 FROM pg_publication WHERE pubname = 'supabase_realtime') THEN
    -- Add each table only if not already a member
    IF NOT EXISTS (
      SELECT 1 FROM pg_publication_tables
      WHERE pubname = 'supabase_realtime' AND tablename = 'inventory_items'
    ) THEN
      ALTER PUBLICATION supabase_realtime ADD TABLE inventory_items;
    END IF;

    IF NOT EXISTS (
      SELECT 1 FROM pg_publication_tables
      WHERE pubname = 'supabase_realtime' AND tablename = 'menu_items'
    ) THEN
      ALTER PUBLICATION supabase_realtime ADD TABLE menu_items;
    END IF;

    IF NOT EXISTS (
      SELECT 1 FROM pg_publication_tables
      WHERE pubname = 'supabase_realtime' AND tablename = 'orders'
    ) THEN
      ALTER PUBLICATION supabase_realtime ADD TABLE orders;
    END IF;

    IF NOT EXISTS (
      SELECT 1 FROM pg_publication_tables
      WHERE pubname = 'supabase_realtime' AND tablename = 'expenses'
    ) THEN
      ALTER PUBLICATION supabase_realtime ADD TABLE expenses;
    END IF;

    IF NOT EXISTS (
      SELECT 1 FROM pg_publication_tables
      WHERE pubname = 'supabase_realtime' AND tablename = 'discount_coupons'
    ) THEN
      ALTER PUBLICATION supabase_realtime ADD TABLE discount_coupons;
    END IF;
  END IF;
END $$;

-- 7. Add missing columns for logo and menu details
ALTER TABLE organizations
ADD COLUMN IF NOT EXISTS logo_url TEXT;

ALTER TABLE menu_items
ADD COLUMN IF NOT EXISTS image_urls TEXT[] DEFAULT '{}',
ADD COLUMN IF NOT EXISTS quantity_info TEXT,
ADD COLUMN IF NOT EXISTS spice_level INTEGER DEFAULT 0;
