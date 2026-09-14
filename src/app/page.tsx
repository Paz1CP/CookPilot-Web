import { redirect } from "next/navigation";
import { headers, cookies } from "next/headers";
import { getLocaleFromAcceptLanguage } from "@/shared/config/routes";

export default async function RootPage() {
  const cookieStore = await cookies();
  const savedLocale = cookieStore.get("cp-locale")?.value;

  if (savedLocale === "en") {
    redirect("/en");
  } else if (savedLocale === "es") {
    redirect("/es");
  }

  const headersList = await headers();
  redirect(`/${getLocaleFromAcceptLanguage(headersList.get("accept-language"))}`);
}
