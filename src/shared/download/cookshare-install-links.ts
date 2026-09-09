import { siteConfig } from "@/shared/config/site";

export type CookShareInstallLinks = {
  googlePlay: string;
  appGallery: string;
};

function canonicalObjectUrl(path: string | undefined) {
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

export function buildCookShareInstallLinks(
  canonicalPath?: string,
): CookShareInstallLinks {
  const googlePlay = new URL(siteConfig.publicData.stores.googlePlay);
  const appGallery = siteConfig.publicData.stores.appGallery;
  const canonicalUrl = canonicalObjectUrl(canonicalPath);
  if (!canonicalUrl) {
    return { googlePlay: googlePlay.toString(), appGallery };
  }

  const referrer = new URLSearchParams({ v: "1", url: canonicalUrl }).toString();
  googlePlay.searchParams.set("referrer", referrer);
  return {
    googlePlay: googlePlay.toString(),
    appGallery: huaweiWrapperUrl(canonicalUrl) ?? appGallery,
  };
}
