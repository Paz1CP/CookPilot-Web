import { siteConfig } from "@/shared/config/site";

export type CookShareInstallLinks = {
  googlePlay: string;
  appGallery: string;
};

export type CookShareAppAction =
  | "view"
  | "cook"
  | "remix"
  | "plan"
  | "list"
  | "fit"
  | "save"
  | "scan";

const APP_ACTIONS = new Set<CookShareAppAction>([
  "view",
  "cook",
  "remix",
  "plan",
  "list",
  "fit",
  "save",
  "scan",
]);

export function isCookShareAppAction(value: unknown): value is CookShareAppAction {
  return typeof value === "string" && APP_ACTIONS.has(value as CookShareAppAction);
}

export function canonicalCookShareUrl(path: string | undefined) {
  if (!path) return null;
  try {
    const site = new URL(siteConfig.publicUrl);
    const candidate = new URL(path, site);
    if (
      candidate.protocol !== "https:" ||
      candidate.origin !== site.origin ||
      candidate.search ||
      candidate.hash
    ) {
      return null;
    }
    return new URL(candidate.pathname, site).toString();
  } catch {
    return null;
  }
}

function huaweiWrapperUrl(canonicalUrl: string) {
  const prefix = siteConfig.publicData.huaweiAppLinkPrefix;
  if (!prefix) return null;
  try {
    const wrapper = new URL(prefix);
    if (
      wrapper.protocol !== "https:" ||
      !wrapper.hostname.toLowerCase().endsWith(".drcn.agconnect.link") ||
      wrapper.username ||
      wrapper.password ||
      wrapper.port ||
      wrapper.search ||
      wrapper.hash
    ) {
      return null;
    }
    wrapper.searchParams.set("deeplink", canonicalUrl);
    return wrapper.toString();
  } catch {
    return null;
  }
}

export function cookShareTransportUrl(
  canonicalPath: string | undefined,
  action?: CookShareAppAction,
) {
  const canonicalUrl = canonicalCookShareUrl(canonicalPath);
  if (!canonicalUrl) return null;
  if (!action) return canonicalUrl;
  if (!isCookShareAppAction(action)) return null;

  const transport = new URL(canonicalUrl);
  transport.searchParams.set("action", action);
  return transport.toString();
}

export function buildCookShareInstallLinks(
  canonicalPath?: string,
  action?: CookShareAppAction,
): CookShareInstallLinks {
  const googlePlay = new URL(siteConfig.publicData.stores.googlePlay);
  const appGallery = siteConfig.publicData.stores.appGallery;
  const transportUrl = cookShareTransportUrl(canonicalPath, action);
  if (!transportUrl) {
    return { googlePlay: googlePlay.toString(), appGallery };
  }

  const referrer = new URLSearchParams({ v: "1", url: transportUrl }).toString();
  googlePlay.searchParams.set("referrer", referrer);
  return {
    googlePlay: googlePlay.toString(),
    appGallery: huaweiWrapperUrl(transportUrl) ?? appGallery,
  };
}
