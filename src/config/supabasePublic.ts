import { createClient } from "@supabase/supabase-js";
import { SUPABASE_URL, SUPABASE_ANON_KEY } from "./config";

// Dedicated client for public/customer-facing pages (QR ordering, etc).
// Kept separate from the main `supabase` client used by the staff
// dashboard so a customer's browser can NEVER accidentally pick up
// a leftover staff login session, and vice versa.
export const supabasePublic = createClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
  auth: {
    autoRefreshToken: true,
    persistSession: true, // needed so the anonymous session survives page reloads
    detectSessionInUrl: false,
    storageKey: "sb-public-customer-auth", // separate storage key from the dashboard client
  },
});