import { supabaseBrowser } from "@/lib/supabase/browser";
import { publicSupabaseConfig } from "@/lib/supabase/public-config";

export const supabase = supabaseBrowser;
export const SUPABASE_URL = publicSupabaseConfig.url;
export const SUPABASE_PUBLISHABLE_KEY = publicSupabaseConfig.publishableKey;
