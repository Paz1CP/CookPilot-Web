import { createHmac, timingSafeEqual } from "node:crypto";
import type { NextRequest, NextResponse } from "next/server";
import { authContinuationConfig } from "@/lib/supabase/config";
import type { AppLocale } from "@/shared/config/routes";
import type { CookShareObjectType } from "@/lib/cookshare/types";

export const continuationCookieName = "cp-auth-continuation";

export type ContinuationAction = "view" | "unlock" | "cook";

export interface AuthContinuation {
  objectType: CookShareObjectType;
  objectId: string;
  ownerId: string | null;
  locale: AppLocale;
  canonicalPath: string;
  action: ContinuationAction;
  createdAt: number;
}

function getSecret() {
  if (!authContinuationConfig.secret) {
    throw new Error("COOKPILOT_AUTH_CONTINUATION_SECRET is required for auth continuation");
  }
  return authContinuationConfig.secret;
}

function encode(value: string) {
  return Buffer.from(value, "utf8").toString("base64url");
}

function decode(value: string) {
  return Buffer.from(value, "base64url").toString("utf8");
}

export function signContinuation(payload: AuthContinuation) {
  const body = encode(JSON.stringify(payload));
  const signature = createHmac("sha256", getSecret()).update(body).digest("base64url");
  return `${body}.${signature}`;
}

export function verifyContinuation(value: string | undefined): AuthContinuation | null {
  if (!value) return null;
  const [body, signature] = value.split(".");
  if (!body || !signature) return null;
  try {
    const expected = createHmac("sha256", getSecret()).update(body).digest();
    const received = Buffer.from(signature, "base64url");
    if (expected.length !== received.length || !timingSafeEqual(expected, received)) return null;
    const parsed = JSON.parse(decode(body)) as Partial<AuthContinuation>;
    if (
      !parsed.objectType ||
      !parsed.objectId ||
      !parsed.canonicalPath?.startsWith("/") ||
      !parsed.locale ||
      !parsed.action ||
      typeof parsed.createdAt !== "number"
    ) return null;
    if (Date.now() - parsed.createdAt > authContinuationConfig.maxAgeSeconds * 1000) return null;
    return parsed as AuthContinuation;
  } catch {
    return null;
  }
}

export function setContinuationCookie(response: NextResponse, payload: AuthContinuation) {
  response.cookies.set(continuationCookieName, signContinuation(payload), {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: authContinuationConfig.maxAgeSeconds,
  });
}

export function clearContinuationCookie(response: NextResponse) {
  response.cookies.set(continuationCookieName, "", {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: 0,
  });
}

export function readContinuation(request: NextRequest) {
  return verifyContinuation(request.cookies.get(continuationCookieName)?.value);
}
