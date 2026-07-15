// src/config/permissions.ts

export type Plan = 'trial' | 'standard' | 'premium' | 'enterprise';

// Broader type for anything that might be passed in from auth state,
// including the superadmin override
export type PlanOrRole = Plan | 'superadmin';

export const FEATURES: Record<Plan, string[]> = {
  trial: [
    'overview', 'orders', 'offline_orders', 'inventory',
    // Give them everything for 7 days to hook them
    'ff_discounts', 'advanced_analytics', 'qr_ordering',
  ],
  standard: [
    'overview', 'orders', 'inventory', 'basic_reports', 'social_view',
    // No ff_discounts, no advanced analytics, no QR ordering
  ],
  premium: [
    'overview', 'orders', 'offline_orders', 'ff_discounts',
    'inventory', 'advanced_analytics', 'basic_reports',
    'social_view', 'qr_ordering', 'n8n_automations',
    'multi_user', 'export_csv',
  ],
  enterprise: [
    // Everything in premium plus multi-branch, white-label
    'overview', 'orders', 'offline_orders', 'ff_discounts',
    'inventory', 'advanced_analytics', 'basic_reports',
    'social_view', 'qr_ordering', 'n8n_automations',
    'multi_user', 'export_csv', 'multi_branch', 'white_label',
    'rag_bot', 'dedicated_support',
  ],
};

export function hasFeature(plan: PlanOrRole, feature: string): boolean {
  if (plan === 'superadmin') return true;
  return FEATURES[plan]?.includes(feature) ?? false;
}

// Helper to safely check if a string is a real Plan key
// (useful if `plan` is coming from the DB as a raw string)
export function isValidPlan(value: string): value is Plan {
  return value in FEATURES;
}