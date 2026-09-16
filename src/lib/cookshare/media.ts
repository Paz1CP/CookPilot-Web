export const COOKSHARE_MEDIA_HOST = "media.cookpilot.pro";

/** Only canonical Cloudflare media URLs may be rendered publicly. */
export function mediaUrl(value: unknown): string | null {
  if (typeof value !== "string") return null;
  try {
    const url = new URL(value);
    return url.protocol === "https:" && url.hostname === COOKSHARE_MEDIA_HOST
      ? url.toString()
      : null;
  } catch {
    return null;
  }
}
