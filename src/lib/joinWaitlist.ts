const FUNCTION_URL =
  "https://ycrqbnrhrlevkcumfqxq.supabase.co/functions/v1/join-waitlist";

export type WaitlistResult =
  | { status: "success" }
  | { status: "alreadyJoined" }
  | { status: "error" };

/**
 * Calls the join-waitlist Edge Function.
 * Never throws — always returns a typed result.
 */
export async function joinWaitlist(email: string): Promise<WaitlistResult> {
  try {
    const res = await fetch(FUNCTION_URL, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email: email.trim().toLowerCase() }),
    });

    // Non-2xx that isn't a handled duplicate
    if (!res.ok && res.status !== 409) {
      return { status: "error" };
    }

    const data: { ok: boolean; alreadyJoined?: boolean } = await res.json();

    if (!data.ok) return { status: "error" };
    if (data.alreadyJoined) return { status: "alreadyJoined" };
    return { status: "success" };
  } catch {
    return { status: "error" };
  }
}
