import { redirect } from "next/navigation";
import { headers, cookies } from "next/headers";

export default async function RootPage() {
  const cookieStore = await cookies();
  const savedLocale = cookieStore.get("cp-locale")?.value;

  if (savedLocale === "en") {
    redirect("/en");
  } else if (savedLocale === "es") {
    redirect("/es");
  }

  const headersList = await headers();
  const acceptLanguage = headersList.get("accept-language") || "";

  if (acceptLanguage.toLowerCase().startsWith("en")) {
    redirect("/en");
  } else {
    redirect("/es");
  }
}
