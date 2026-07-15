// src/config/permissions.js
export const FEATURES = {
  trial: [
    'overview', 'orders', 'offline_orders', 'inventory',
    'social_view', 'basic_reports',
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

export function hasFeature(plan, feature) {
  if (plan === "superadmin") return true;
  return FEATURES[plan]?.includes(feature) ?? false;
}