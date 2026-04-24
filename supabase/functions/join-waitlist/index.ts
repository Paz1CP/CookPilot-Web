import "jsr:@supabase/functions-js/edge-runtime.d.ts";
import { createClient } from "jsr:@supabase/supabase-js@2";

const CORS_HEADERS = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type, Authorization",
};

function json(data: unknown, status = 200) {
  return new Response(JSON.stringify(data), {
    status,
    headers: { ...CORS_HEADERS, "Content-Type": "application/json" },
  });
}

// Basic but production-grade email format check
function isValidEmail(value: string): boolean {
  return /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(value);
}

Deno.serve(async (req: Request) => {
  // Handle CORS preflight
  if (req.method === "OPTIONS") {
    return new Response(null, { status: 204, headers: CORS_HEADERS });
  }

  if (req.method !== "POST") {
    return json({ ok: false, error: "Method not allowed" }, 405);
  }

  // Parse body
  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return json({ ok: false, error: "Invalid JSON body" }, 400);
  }

  if (!body || typeof body !== "object") {
    return json({ ok: false, error: "Missing body" }, 400);
  }

  const raw = (body as Record<string, unknown>).email;
  if (typeof raw !== "string") {
    return json({ ok: false, error: "email must be a string" }, 400);
  }

  const email = raw.trim().toLowerCase();

  if (!isValidEmail(email)) {
    return json({ ok: false, error: "Invalid email format" }, 422);
  }

  // Build Supabase client with service role (safe inside Edge Function only)
  const supabase = createClient(
    Deno.env.get("SUPABASE_URL")!,
    Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!,
  );

  const { error } = await supabase
    .schema("users")
    .from("waitlist")
    .insert({ email });

  if (!error) {
    return json({ ok: true, alreadyJoined: false });
  }

  // Unique constraint violation → email already exists
  if (error.code === "23505") {
    return json({ ok: true, alreadyJoined: true });
  }

  // Unexpected DB error
  console.error("[join-waitlist] DB error:", error);
  return json({ ok: false, error: "Database error" }, 500);
});
