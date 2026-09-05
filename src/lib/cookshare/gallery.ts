import { supabaseConfig } from "@/lib/supabase/config";
import { createSupabaseInternalClient } from "@/lib/supabase/internal";
import { buildCookSharePath, type AppLocale } from "@/shared/config/routes";
import type {
  GalleryCard,
  GalleryPage,
  GalleryState,
  GalleryType,
  HandleGalleryCard,
} from "./types";

const PAGE_SIZE = 24;

type BankRow = {
  component_type?: string | null;
  bank_rank?: number | null;
  recipe_id?: string | null;
  title?: string | null;
  title_norm?: string | null;
  time_minutes?: number | null;
  total_minutes?: number | null;
  kcal?: number | null;
  protein?: number | null;
  carbs?: number | null;
  fat?: number | null;
  fiber?: number | null;
};

type RecipeRow = {
  id: string;
  title?: string | null;
  title_en?: string | null;
  description?: string | null;
  description_en?: string | null;
  cover_photo_url?: string | null;
  is_free_recipe?: boolean | null;
};

type RouteRow = {
  object_id: string;
  handle?: string | null;
  slug: string;
  route_kind?: string | null;
  is_current?: boolean | null;
};

function normalizeText(value: string) {
  return value
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .replace(/[^a-z0-9\s-]/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

function encodeCursor(row: BankRow) {
  const value = JSON.stringify({
    rank: row.bank_rank ?? 0,
    title: row.title_norm ?? normalizeText(row.title ?? ""),
    id: row.recipe_id ?? "",
  });
  return Buffer.from(value, "utf8").toString("base64url");
}

function decodeCursor(cursor: string | null) {
  if (!cursor) return null;
  try {
    const parsed = JSON.parse(Buffer.from(cursor, "base64url").toString("utf8"));
    if (typeof parsed.rank !== "number" || typeof parsed.title !== "string" || typeof parsed.id !== "string") return null;
    return parsed as { rank: number; title: string; id: string };
  } catch {
    return null;
  }
}

function compareRow(row: BankRow, cursor: { rank: number; title: string; id: string }) {
  const rank = row.bank_rank ?? 0;
  const title = row.title_norm ?? normalizeText(row.title ?? "");
  const id = row.recipe_id ?? "";
  if (rank !== cursor.rank) return rank - cursor.rank;
  if (title !== cursor.title) return title.localeCompare(cursor.title);
  return id.localeCompare(cursor.id);
}

function mediaUrl(value: string | null | undefined) {
  if (!value) return null;
  try {
    const url = new URL(value, supabaseConfig.mediaBaseUrl);
    return url.origin === new URL(supabaseConfig.mediaBaseUrl).origin ? url.toString() : null;
  } catch {
    return null;
  }
}

export function parseGalleryState(locale: AppLocale, searchParams: Record<string, string | string[] | undefined>): GalleryState {
  const rawQ = Array.isArray(searchParams.q) ? searchParams.q[0] : searchParams.q;
  const rawType = Array.isArray(searchParams.type) ? searchParams.type[0] : searchParams.type;
  const type: GalleryType = ["all", "recipes", "menus", "days", "weeks", "ingredients"].includes(rawType ?? "")
    ? (rawType as GalleryType)
    : "all";
  const rawCursor = Array.isArray(searchParams.cursor) ? searchParams.cursor[0] : searchParams.cursor;
  return {
    locale,
    q: normalizeText((rawQ ?? "").slice(0, 80)),
    type,
    cursor: decodeCursor(rawCursor ?? null) ? rawCursor ?? null : null,
  };
}

export async function getGalleryPage(state: GalleryState, limit = PAGE_SIZE): Promise<GalleryPage> {
  const boundedLimit = Math.min(Math.max(limit, 1), PAGE_SIZE);
  if (state.type !== "all" && state.type !== "recipes") {
    return { items: [], nextCursor: null, state };
  }

  let internal: ReturnType<typeof createSupabaseInternalClient>;
  try {
    internal = createSupabaseInternalClient();
  } catch {
    return { items: [], nextCursor: null, state };
  }
  const bankResult = await internal
    .schema("home")
    .from("cookmatch_recipe_bank")
    .select("*")
    .order("bank_rank", { ascending: true })
    .limit(500);
  if (bankResult.error || !Array.isArray(bankResult.data)) {
    return { items: [], nextCursor: null, state };
  }

  const bankRows = (bankResult.data as BankRow[])
    .filter((row) => row.recipe_id && (!row.component_type || row.component_type === "recipe"))
    .filter((row) => !state.q || normalizeText(row.title_norm ?? row.title ?? "").includes(state.q))
    .sort((a, b) => {
      const rank = (a.bank_rank ?? 0) - (b.bank_rank ?? 0);
      if (rank) return rank;
      const title = (a.title_norm ?? "").localeCompare(b.title_norm ?? "");
      return title || (a.recipe_id ?? "").localeCompare(b.recipe_id ?? "");
    });

  const decoded = decodeCursor(state.cursor);
  const afterCursor = decoded ? bankRows.filter((row) => compareRow(row, decoded) > 0) : bankRows;
  const pageRows = afterCursor.slice(0, boundedLimit);
  const ids = pageRows.map((row) => row.recipe_id!).filter(Boolean);
  if (!ids.length) return { items: [], nextCursor: null, state };

  const [recipesResult, routesResult] = await Promise.all([
    internal.schema("menu").from("recipes").select("id,title,title_en,description,description_en,cover_photo_url,is_free_recipe").in("id", ids),
    internal.schema("home").from("cookshare_public_routes").select("object_id,handle,slug,route_kind,is_current").eq("object_type", "recipe").eq("is_current", true).eq("route_kind", "current").in("object_id", ids),
  ]);

  if (recipesResult.error || routesResult.error) return { items: [], nextCursor: null, state };
  const recipes = new Map((recipesResult.data as RecipeRow[]).map((recipe) => [recipe.id, recipe]));
  const routes = new Map((routesResult.data as RouteRow[]).map((route) => [route.object_id, route]));
  const items: GalleryCard[] = [];

  for (const row of pageRows) {
    const recipe = recipes.get(row.recipe_id!);
    const route = routes.get(row.recipe_id!);
    if (!recipe || !route) continue;
    const title = state.locale === "en" ? recipe.title_en || recipe.title || row.title || "CookPilot recipe" : recipe.title || recipe.title_en || row.title || "Receta CookPilot";
    const description = state.locale === "en" ? recipe.description_en || recipe.description || null : recipe.description || recipe.description_en || null;
    items.push({
      objectType: "recipe",
      objectId: recipe.id,
      title,
      description,
      imageUrl: mediaUrl(recipe.cover_photo_url),
      href: buildCookSharePath({ locale: state.locale, objectType: "recipe", handle: route.handle, slug: route.slug }),
      isFree: Boolean(recipe.is_free_recipe),
      timeMinutes: row.total_minutes ?? row.time_minutes ?? null,
      nutrition: {
        kcal: row.kcal ?? null,
        protein: row.protein ?? null,
        carbs: row.carbs ?? null,
        fat: row.fat ?? null,
        fiber: row.fiber ?? null,
      },
    });
  }

  const lastRow = pageRows.at(-1);
  return {
    items,
    nextCursor: afterCursor.length > boundedLimit && lastRow ? encodeCursor(lastRow) : null,
    state,
  };
}

export async function getHandleGallery(handle: string, locale: AppLocale, actorId: string | null): Promise<{ ownerId: string | null; cards: HandleGalleryCard[] }> {
  const normalizedHandle = handle.replace(/^@/, "").trim().toLowerCase();
  if (!/^[a-z0-9][a-z0-9._-]{2,29}$/.test(normalizedHandle)) return { ownerId: null, cards: [] };
  let internal: ReturnType<typeof createSupabaseInternalClient>;
  try {
    internal = createSupabaseInternalClient();
  } catch {
    return { ownerId: null, cards: [] };
  }
  const routesResult = await internal.schema("home").from("cookshare_public_routes").select("object_type,object_id,owner_id,handle,slug,route_kind,is_current").eq("handle", normalizedHandle).eq("is_current", true).eq("route_kind", "current").limit(120);
  if (routesResult.error || !Array.isArray(routesResult.data)) return { ownerId: null, cards: [] };
  const routes = routesResult.data as Array<RouteRow & { object_type: string; owner_id?: string | null }>;
  const ownerId = routes[0]?.owner_id ?? null;
  const activeRoutes = await Promise.all(routes.map(async (route) => {
    const owner = route.owner_id ?? ownerId;
    const { data, error } = await internal.schema("home").rpc("fn_cookshare_effective_public", {
      p_object_type: route.object_type,
      p_object_id: route.object_id,
      p_actor_id: actorId,
    });
    return { route, private: error ? true : data !== true, isOwner: Boolean(owner && owner === actorId) };
  }));
  const visible = activeRoutes.filter(({ private: isPrivate, isOwner }) => !isPrivate || isOwner);
  const recipeIds = visible.filter(({ route }) => route.object_type === "recipe").map(({ route }) => route.object_id);
  const recipeResult = recipeIds.length ? await internal.schema("menu").from("recipes").select("id,title,title_en,cover_photo_url").in("id", recipeIds) : { data: [], error: null };
  const recipeMap = new Map((recipeResult.data as Array<{ id: string; title?: string | null; title_en?: string | null; cover_photo_url?: string | null }>).map((item) => [item.id, item]));
  const cards = visible.flatMap(({ route, private: isPrivate }) => {
    const recipe = recipeMap.get(route.object_id);
    const title = recipe ? (locale === "en" ? recipe.title_en || recipe.title : recipe.title || recipe.title_en) : route.slug.replace(/-/g, " ");
    return [{
      objectType: route.object_type as HandleGalleryCard["objectType"],
      objectId: route.object_id,
      title: title || "CookPilot",
      href: buildCookSharePath({ locale, objectType: route.object_type as HandleGalleryCard["objectType"], handle: normalizedHandle, slug: route.slug }),
      imageUrl: recipe ? mediaUrl(recipe.cover_photo_url) : null,
      isPrivate: isPrivate && Boolean(actorId),
    }];
  });
  return { ownerId, cards };
}
