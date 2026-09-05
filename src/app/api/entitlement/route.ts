import { NextResponse } from "next/server";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { createSupabaseInternalClient } from "@/lib/supabase/internal";

export async function GET() {
  const sessionClient = await createSupabaseServerClient();
  const { data: userData, error: userError } = await sessionClient.auth.getUser();
  if (userError || !userData.user) {
    return NextResponse.json({ tier: "anonymous" }, { status: 401, headers: { "Cache-Control": "private, no-store" } });
  }

  const internal = createSupabaseInternalClient();
  const { data, error } = await internal.schema("billing").rpc("fn_effective_tier_for_user", {
    p_user_id: userData.user.id,
    p_now: new Date().toISOString(),
  });
  const tier = error ? "free" : typeof data === "string" ? data : "free";
  return NextResponse.json({ tier }, { headers: { "Cache-Control": "private, no-store" } });
}
