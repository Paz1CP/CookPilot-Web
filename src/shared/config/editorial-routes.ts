import { localizedRoutes } from "./routes";

const editorialRouteKeys = ["howItWorks", "guides", "faq", "compare"] as const;

/** Keep editorial-only treatments out of the approved landing and Gallery. */
export function isEditorialRoute(pathname: string | null) {
  return editorialRouteKeys.some((key) =>
    pathname === localizedRoutes.es[key] || pathname === localizedRoutes.en[key],
  );
}
