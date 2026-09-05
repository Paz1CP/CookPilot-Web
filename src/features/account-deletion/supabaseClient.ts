import { supabaseBrowser } from "@/lib/supabase/browser";
import { supabaseConfig } from "@/lib/supabase/config";

export const supabase = supabaseBrowser;
export const SUPABASE_URL = supabaseConfig.url;
export const SUPABASE_PUBLISHABLE_KEY = supabaseConfig.publishableKey;
