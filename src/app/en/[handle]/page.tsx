import { notFound } from "next/navigation";
import type { Metadata } from "next";
import HandleGallery from "@/features/gallery/HandleGallery";
import { absoluteUrl } from "@/shared/config/site";
import { buildHandlePath } from "@/shared/config/routes";

export async function generateMetadata({ params }: { params: Promise<{ handle: string }> }): Promise<Metadata> {
  const handle = (await params).handle.replace(/^@/, "");
  const path = buildHandlePath("en", handle);
  return {
    title: `@${handle} | CookShare`,
    alternates: { canonical: absoluteUrl(path), languages: { es: absoluteUrl(buildHandlePath("es", handle)), en: absoluteUrl(path) } },
  };
}

export default async function Page({ params }: { params: Promise<{ handle: string }> }) {
  const handle = (await params).handle;
  if (!handle.startsWith("@")) notFound();
  return <HandleGallery handle={handle} locale="en" />;
}
