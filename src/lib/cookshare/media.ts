export const COOKSHARE_MEDIA_HOST = "media.cookpilot.pro";

/** Only canonical Cloudflare media URLs may be rendered publicly. */
export function mediaUrl(value: unknown): string | null {
  if (!value) return null;
  if (Array.isArray(value)) {
    for (const item of value) {
      const resolved = mediaUrl(item);
      if (resolved) return resolved;
    }
    return null;
  }
  if (typeof value !== "string") return null;
  const trimmed = value.trim();
  if (!trimmed) return null;
  try {
    const url = new URL(trimmed);
    if (url.protocol !== "https:") return null;
    if (url.hostname === COOKSHARE_MEDIA_HOST) {
      return url.toString();
    }
    // Supabase public storage bucket "recipes" CDN mapping:
    // https://<project>.supabase.co/storage/v1/object/public/recipes/... -> https://media.cookpilot.pro/recipes/...
    if (url.hostname.endsWith(".supabase.co") && url.pathname.startsWith("/storage/v1/object/public/")) {
      const canonicalPath = url.pathname.replace(/^\/storage\/v1\/object\/public/, "");
      return `https://${COOKSHARE_MEDIA_HOST}${canonicalPath}`;
    }
    return null;
  } catch {
    return null;
  }
}

/**
 * Extracts a valid media URL from any recipe, component, or public object payload.
 * Checks all possible image fields: cover_photo_url, image_url, user_image_urls,
 * image_urls, images, and user_image_url.
 */
export function extractMediaUrl(source: unknown): string | null {
  if (!source) return null;
  if (typeof source === "string" || Array.isArray(source)) {
    return mediaUrl(source);
  }
  if (typeof source !== "object") return null;
  const record = source as Record<string, unknown>;
  return (
    mediaUrl(record.cover_photo_url) ??
    mediaUrl(record.image_url) ??
    mediaUrl(record.user_image_urls) ??
    mediaUrl(record.image_urls) ??
    mediaUrl(record.images) ??
    mediaUrl(record.user_image_url) ??
    mediaUrl(record.imageUrl)
  );
}
