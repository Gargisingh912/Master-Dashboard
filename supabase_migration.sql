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
