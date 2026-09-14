-- CookShare Gallery definitive public search/filter RPC
-- Generated against the live CookPilot schema on 2026-09-14.
--
-- Contract:
--   * Search/filter operates against the full authoritative public catalog.
--   * home.cookmatch_recipe_bank is intentionally NOT referenced here.
--   * Text matching copies CookSearch's exact -> prefix -> contains -> fuzzy semantics.
--   * Recipe semantic thresholds copy the live CookSearch matcher semantics.
--   * Lists/categories remain supported only as explicit internal enumeration types;
--     they are not emitted by global `all` search. Lists are not text-searchable.
--   * One Gallery time dimension is used: menu.recipe_time_estimates.total_minutes_avg.
--   * Numeric cost/budget filters are intentionally not exposed by this anonymous/public RPC.

begin;

-- The return table is part of the public contract, so drop the current signature
-- before recreating it when this source is promoted after a contract change.
drop function if exists home.rpc_cookshare_gallery_candidates(
  text, text, text, text,
  text[], text[], text[], text[], text[],
  integer, integer, text, integer, jsonb, jsonb
);

drop function if exists home.rpc_cookshare_gallery_candidates(
  text, text, text, text,
  text[], text[], text[], text[], text[],
  integer, integer, text, integer,
  integer, text, uuid, text, jsonb
);

-- Remove the legacy overload so named calls with omitted p_filters cannot become ambiguous.
drop function if exists home.rpc_cookshare_gallery_candidates(
  text, text, text, text,
  text[], text[], text[], text[], text[],
  integer, integer, text, integer,
  integer, text, uuid, text
);

create function home.rpc_cookshare_gallery_candidates(
  p_locale text default 'es',
  p_type text default 'all',
  p_query text default null,
  p_handle text default null,
  p_categories text[] default '{}'::text[],
  p_meals text[] default '{}'::text[],
  p_components text[] default '{}'::text[],
  p_ingredients text[] default '{}'::text[],
  p_excluded_ingredients text[] default '{}'::text[],
  p_min_time integer default null,
  p_max_time integer default null,
  p_access text default 'all',
  p_limit integer default 24,
  p_cursor jsonb default null,
  p_filters jsonb default '{}'::jsonb
)
returns table(
  object_type text,
  object_id uuid,
  owner_id uuid,
  handle text,
  slug text,
  title text,
  title_en text,
  description text,
  description_en text,
  image_url text,
  is_free boolean,
  time_minutes integer,
  nutrition jsonb,
  rank integer,
  component text,
  slot_profile jsonb,
  ingredients text[],
  match_type text,
  relevance_score numeric,
  total_count bigint,
  cursor jsonb
)
language plpgsql
stable
security definer
set search_path = ''
set statement_timeout = '5min'
as $function$
declare
  v_locale text := case when lower(left(coalesce(p_locale, 'es'), 2)) = 'en' then 'en' else 'es' end;
  v_type text := lower(trim(coalesce(p_type, 'all')));
  v_query text := nullif(trim(coalesce(p_query, '')), '');
  v_query_normalized text := null;
  v_query_dense text := null;
  v_handle text := nullif(lower(regexp_replace(trim(coalesce(p_handle, '')), '^@', '')), '');
  v_limit integer := least(greatest(coalesce(p_limit, 24), 1), 100);
  v_filters jsonb := case when p_filters is not null and jsonb_typeof(p_filters) = 'object' then p_filters else '{}'::jsonb end;
  v_cursor jsonb := case when p_cursor is not null and jsonb_typeof(p_cursor) = 'object' then p_cursor else '{}'::jsonb end;
  v_cursor_match_type integer := null;
  v_cursor_similarity numeric := null;
  v_cursor_query_score numeric := null;
  v_cursor_object_priority integer := null;
  v_cursor_component integer := null;
  v_cursor_eligibility integer := null;
  v_cursor_cultural integer := null;
  v_cursor_status numeric := null;
  v_cursor_category integer := null;
  v_cursor_title text := null;
  v_cursor_object_id uuid := null;
  v_cursor_object_type text := null;
  v_cursor_valid boolean := false;

  v_categories text[] := '{}'::text[];
  v_meals text[] := '{}'::text[];
  v_components text[] := '{}'::text[];
  v_ingredients_include text[] := '{}'::text[];
  v_ingredients_exclude text[] := '{}'::text[];
  v_access text[] := '{}'::text[];
  v_cultural_profiles text[] := '{}'::text[];
  v_badges text[] := '{}'::text[];

  v_excluded_meals text[] := '{}'::text[];
  v_excluded_components text[] := '{}'::text[];
  v_menu_function_roles text[] := '{}'::text[];
  v_service_modes text[] := '{}'::text[];
  v_cultural_intents text[] := '{}'::text[];
  v_taste_profiles text[] := '{}'::text[];
  v_component_profiles text[] := '{}'::text[];
  v_texture_profiles text[] := '{}'::text[];

  v_ingredient_categories text[] := '{}'::text[];
  v_matrix_families text[] := '{}'::text[];
  v_ingredient_states text[] := '{}'::text[];
  v_processing_types text[] := '{}'::text[];

  v_time_min integer := null;
  v_time_max integer := null;
  v_kcal_min numeric := null;
  v_kcal_max numeric := null;
  v_protein_min numeric := null;
  v_protein_max numeric := null;
  v_carbs_min numeric := null;
  v_carbs_max numeric := null;
  v_fat_min numeric := null;
  v_fat_max numeric := null;
  v_fiber_min numeric := null;
  v_fiber_max numeric := null;
  v_score_min numeric := null;
  v_score_max numeric := null;
  v_servings_min integer := null;
  v_servings_max integer := null;

  v_ingredient_kcal_min numeric := null;
  v_ingredient_kcal_max numeric := null;
  v_ingredient_protein_min numeric := null;
  v_ingredient_protein_max numeric := null;
  v_ingredient_carbs_min numeric := null;
  v_ingredient_carbs_max numeric := null;
  v_ingredient_fat_min numeric := null;
  v_ingredient_fat_max numeric := null;
  v_ingredient_fiber_min numeric := null;
  v_ingredient_fiber_max numeric := null;

  v_recipe_filters_active boolean := false;
  v_ingredient_filters_active boolean := false;
begin
  if v_type not in ('all', 'recipes', 'menus', 'days', 'weeks', 'ingredients', 'categories', 'lists', 'handles') then
    v_type := 'all';
  end if;

  if v_query is not null then
    v_query_normalized := nullif(
      regexp_replace(
        lower(public.unaccent(regexp_replace(v_query, '[^[:alnum:][:space:]]+', ' ', 'g'))),
        '\s+', ' ', 'g'
      ),
      ''
    );
    v_query_dense := nullif(regexp_replace(v_query_normalized, '\s+', '', 'g'), '');
  end if;

  -- Keyset cursors carry only the deterministic ordering tuple. Invalid or stale
  -- cursors are treated as non-paginable instead of being interpreted partially.
  if p_cursor is not null and jsonb_typeof(p_cursor) = 'object' then
    begin
      if jsonb_typeof(v_cursor -> 'm') = 'number' then v_cursor_match_type := (v_cursor ->> 'm')::integer; end if;
      if jsonb_typeof(v_cursor -> 's') = 'number' then v_cursor_similarity := (v_cursor ->> 's')::numeric; end if;
      if jsonb_typeof(v_cursor -> 'q') = 'number' then v_cursor_query_score := (v_cursor ->> 'q')::numeric; end if;
      if jsonb_typeof(v_cursor -> 'o') = 'number' then v_cursor_object_priority := (v_cursor ->> 'o')::integer; end if;
      if jsonb_typeof(v_cursor -> 'c') = 'number' then v_cursor_component := (v_cursor ->> 'c')::integer; end if;
      if jsonb_typeof(v_cursor -> 'e') = 'number' then v_cursor_eligibility := (v_cursor ->> 'e')::integer; end if;
      if jsonb_typeof(v_cursor -> 'u') = 'number' then v_cursor_cultural := (v_cursor ->> 'u')::integer; end if;
      if jsonb_typeof(v_cursor -> 'b') = 'number' then v_cursor_status := (v_cursor ->> 'b')::numeric; end if;
      if jsonb_typeof(v_cursor -> 'k') = 'number' then v_cursor_category := (v_cursor ->> 'k')::integer; end if;
      if jsonb_typeof(v_cursor -> 't') = 'string' then v_cursor_title := v_cursor ->> 't'; end if;
      if jsonb_typeof(v_cursor -> 'i') = 'string' then v_cursor_object_id := (v_cursor ->> 'i')::uuid; end if;
      if jsonb_typeof(v_cursor -> 'y') = 'string' then v_cursor_object_type := v_cursor ->> 'y'; end if;
      v_cursor_valid := v_cursor_match_type is not null
        and v_cursor_similarity is not null
        and v_cursor_query_score is not null
        and v_cursor_object_priority is not null
        and v_cursor_component is not null
        and v_cursor_eligibility is not null
        and v_cursor_cultural is not null
        and v_cursor_status is not null
        and v_cursor_category is not null
        and v_cursor_title is not null
        and v_cursor_object_id is not null
        and v_cursor_object_type is not null;
    exception when others then
      v_cursor_valid := false;
    end;
  end if;

  -- Legacy args + normalized JSON facet contract. Arrays are canonicalized and de-duplicated.
  select coalesce(array_agg(distinct value order by value), '{}'::text[])
  into v_categories
  from (
    select lower(trim(x)) as value from unnest(coalesce(p_categories, '{}'::text[])) x
    union all
    select lower(trim(x)) from jsonb_array_elements_text(
      case when jsonb_typeof(v_filters -> 'categories') = 'array' then v_filters -> 'categories' else '[]'::jsonb end
    ) x
  ) s
  where nullif(value, '') is not null;

  select coalesce(array_agg(distinct value order by value), '{}'::text[])
  into v_meals
  from (
    select lower(trim(x)) as value from unnest(coalesce(p_meals, '{}'::text[])) x
    union all
    select lower(trim(x)) from jsonb_array_elements_text(
      case when jsonb_typeof(v_filters -> 'meal_moments') = 'array' then v_filters -> 'meal_moments' else '[]'::jsonb end
    ) x
  ) s
  where value in ('breakfast','morning_snack','lunch','afternoon_snack','dinner','late_night');

  select coalesce(array_agg(distinct value order by value), '{}'::text[])
  into v_components
  from (
    select lower(trim(x)) as value from unnest(coalesce(p_components, '{}'::text[])) x
    union all
    select lower(trim(x)) from jsonb_array_elements_text(
      case when jsonb_typeof(v_filters -> 'component_types') = 'array' then v_filters -> 'component_types' else '[]'::jsonb end
    ) x
  ) s
  where value in ('main_dish','appetizer','side_dish','salad','beverage','sauce','dessert','dressing');

  select coalesce(array_agg(distinct value order by value), '{}'::text[])
  into v_ingredients_include
  from (
    select regexp_replace(lower(public.unaccent(regexp_replace(trim(x), '[^[:alnum:][:space:]-]+', ' ', 'g'))), '[-\s]+', ' ', 'g') as value
    from unnest(coalesce(p_ingredients, '{}'::text[])) x
    union all
    select regexp_replace(lower(public.unaccent(regexp_replace(trim(x), '[^[:alnum:][:space:]-]+', ' ', 'g'))), '[-\s]+', ' ', 'g')
    from jsonb_array_elements_text(
      case when jsonb_typeof(v_filters -> 'ingredients_include') = 'array' then v_filters -> 'ingredients_include' else '[]'::jsonb end
    ) x
  ) s
  where nullif(value, '') is not null;

  select coalesce(array_agg(distinct value order by value), '{}'::text[])
  into v_ingredients_exclude
  from (
    select regexp_replace(lower(public.unaccent(regexp_replace(trim(x), '[^[:alnum:][:space:]-]+', ' ', 'g'))), '[-\s]+', ' ', 'g') as value
    from unnest(coalesce(p_excluded_ingredients, '{}'::text[])) x
    union all
    select regexp_replace(lower(public.unaccent(regexp_replace(trim(x), '[^[:alnum:][:space:]-]+', ' ', 'g'))), '[-\s]+', ' ', 'g')
    from jsonb_array_elements_text(
      case when jsonb_typeof(v_filters -> 'ingredients_exclude') = 'array' then v_filters -> 'ingredients_exclude' else '[]'::jsonb end
    ) x
  ) s
  where nullif(value, '') is not null;

  select coalesce(array_agg(distinct value order by value), '{}'::text[])
  into v_access
  from (
    select lower(trim(p_access)) as value where lower(trim(coalesce(p_access, 'all'))) in ('free','pro')
    union all
    select lower(trim(x)) from jsonb_array_elements_text(
      case when jsonb_typeof(v_filters -> 'access') = 'array' then v_filters -> 'access' else '[]'::jsonb end
    ) x
  ) s
  where value in ('free','pro');

  select coalesce(array_agg(distinct value order by value), '{}'::text[])
  into v_cultural_profiles
  from (
    select lower(trim(x)) as value
    from jsonb_array_elements_text(
      case when jsonb_typeof(v_filters -> 'cultural_profiles') = 'array' then v_filters -> 'cultural_profiles' else '[]'::jsonb end
    ) x
    union all
    select lower(trim(x))
    from jsonb_array_elements_text(
      case when jsonb_typeof(v_filters -> 'cultural_profile') = 'array' then v_filters -> 'cultural_profile' else '[]'::jsonb end
    ) x
    union all
    select lower(trim(v_filters ->> 'cultural_profile'))
    where jsonb_typeof(v_filters -> 'cultural_profile') = 'string'
  ) s
  where value in ('sacred_loved','iconic','daily','none');

  select coalesce(array_agg(distinct lower(trim(x)) order by lower(trim(x))), '{}'::text[])
  into v_badges
  from jsonb_array_elements_text(
    case when jsonb_typeof(v_filters -> 'badges') = 'array' then v_filters -> 'badges' else '[]'::jsonb end
  ) x
  where nullif(trim(x), '') is not null;

  -- Canonical CookSearch filter dimensions: same identities and thresholds as the app matcher.
  select coalesce(array_agg(distinct lower(trim(x)) order by lower(trim(x))), '{}'::text[])
  into v_excluded_meals
  from jsonb_array_elements_text(
    case when jsonb_typeof(v_filters -> 'excluded_meal_moments') = 'array' then v_filters -> 'excluded_meal_moments' else '[]'::jsonb end
  ) x
  where lower(trim(x)) in ('breakfast','morning_snack','lunch','afternoon_snack','dinner','late_night');

  select coalesce(array_agg(distinct lower(trim(x)) order by lower(trim(x))), '{}'::text[])
  into v_excluded_components
  from jsonb_array_elements_text(
    case when jsonb_typeof(v_filters -> 'excluded_component_types') = 'array' then v_filters -> 'excluded_component_types' else '[]'::jsonb end
  ) x
  where lower(trim(x)) in ('main_dish','appetizer','side_dish','salad','beverage','sauce','dessert','dressing');

  select coalesce(array_agg(distinct lower(trim(x)) order by lower(trim(x))), '{}'::text[])
  into v_menu_function_roles
  from jsonb_array_elements_text(
    case when jsonb_typeof(v_filters -> 'menu_function_roles') = 'array' then v_filters -> 'menu_function_roles' else '[]'::jsonb end
  ) x
  where lower(trim(x)) in ('anchor','support','cut','refresh','close');

  select coalesce(array_agg(distinct lower(trim(x)) order by lower(trim(x))), '{}'::text[])
  into v_service_modes
  from jsonb_array_elements_text(
    case when jsonb_typeof(v_filters -> 'service_modes') = 'array' then v_filters -> 'service_modes' else '[]'::jsonb end
  ) x
  where lower(trim(x)) in ('hot','warm','cold','room_temp','refreshing','digestive');

  select coalesce(array_agg(distinct lower(trim(x)) order by lower(trim(x))), '{}'::text[])
  into v_cultural_intents
  from jsonb_array_elements_text(
    case when jsonb_typeof(v_filters -> 'cultural_intents') = 'array' then v_filters -> 'cultural_intents' else '[]'::jsonb end
  ) x
  where lower(trim(x)) in ('sacred_loved','iconic','daily','explore');

  select coalesce(array_agg(distinct lower(trim(x)) order by lower(trim(x))), '{}'::text[])
  into v_taste_profiles
  from jsonb_array_elements_text(
    case when jsonb_typeof(v_filters -> 'taste_profiles') = 'array' then v_filters -> 'taste_profiles' else '[]'::jsonb end
  ) x
  where lower(trim(x)) in ('sweet','salty','sour','spicy','umami','low_bitter');

  select coalesce(array_agg(distinct lower(trim(x)) order by lower(trim(x))), '{}'::text[])
  into v_component_profiles
  from jsonb_array_elements_text(
    case when jsonb_typeof(v_filters -> 'component_profiles') = 'array' then v_filters -> 'component_profiles' else '[]'::jsonb end
  ) x
  where lower(trim(x)) in ('main_dish','appetizer','side_dish','salad','beverage','sauce','dessert','dressing');

  -- Consumer texture vocabulary is intentionally finite and sourced from the
  -- populated MESA sensory cache. Raw scores and internal model fields never
  -- cross the public RPC boundary.
  select coalesce(array_agg(distinct lower(trim(x)) order by lower(trim(x))), '{}'::text[])
  into v_texture_profiles
  from jsonb_array_elements_text(
    case when jsonb_typeof(v_filters -> 'texture_profiles') = 'array' then v_filters -> 'texture_profiles' else '[]'::jsonb end
  ) x
  where lower(trim(x)) in ('creamy','soft','crispy','crunchy','juicy','tender','firm','smooth','liquid','saucy','chewy','flaky');

  -- Ingredient-object facets from the real ingredient domain.
  select coalesce(array_agg(distinct lower(trim(x)) order by lower(trim(x))), '{}'::text[])
  into v_ingredient_categories
  from jsonb_array_elements_text(
    case when jsonb_typeof(v_filters -> 'ingredient_categories') = 'array' then v_filters -> 'ingredient_categories' else '[]'::jsonb end
  ) x
  where nullif(trim(x), '') is not null;

  select coalesce(array_agg(distinct lower(trim(x)) order by lower(trim(x))), '{}'::text[])
  into v_matrix_families
  from jsonb_array_elements_text(
    case when jsonb_typeof(v_filters -> 'matrix_families') = 'array' then v_filters -> 'matrix_families' else '[]'::jsonb end
  ) x
  where nullif(trim(x), '') is not null;

  select coalesce(array_agg(distinct lower(trim(x)) order by lower(trim(x))), '{}'::text[])
  into v_ingredient_states
  from jsonb_array_elements_text(
    case when jsonb_typeof(v_filters -> 'ingredient_states') = 'array' then v_filters -> 'ingredient_states' else '[]'::jsonb end
  ) x
  where lower(trim(x)) in ('raw','cooked');

  select coalesce(array_agg(distinct lower(trim(x)) order by lower(trim(x))), '{}'::text[])
  into v_processing_types
  from jsonb_array_elements_text(
    case when jsonb_typeof(v_filters -> 'processing_types') = 'array' then v_filters -> 'processing_types' else '[]'::jsonb end
  ) x
  where lower(trim(x)) in ('natural','minimal_processed','processed','ultra_processed');

  -- Numeric facets accept JSON numbers only. Malformed public input is normalized out, not cast blindly.
  v_time_min := p_min_time;
  if v_time_min is null and jsonb_typeof(v_filters -> 'time_min_minutes') = 'number' then
    v_time_min := greatest(0, (v_filters ->> 'time_min_minutes')::integer);
  end if;
  v_time_max := p_max_time;
  if v_time_max is null and jsonb_typeof(v_filters -> 'time_max_minutes') = 'number' then
    v_time_max := greatest(0, (v_filters ->> 'time_max_minutes')::integer);
  end if;
  if v_time_min is not null and v_time_max is not null and v_time_min > v_time_max then
    v_time_min := null;
    v_time_max := null;
  end if;

  if jsonb_typeof(v_filters -> 'kcal_min') = 'number' then v_kcal_min := (v_filters ->> 'kcal_min')::numeric; end if;
  if jsonb_typeof(v_filters -> 'kcal_max') = 'number' then v_kcal_max := (v_filters ->> 'kcal_max')::numeric; end if;
  if jsonb_typeof(v_filters -> 'protein_min') = 'number' then v_protein_min := (v_filters ->> 'protein_min')::numeric; end if;
  if jsonb_typeof(v_filters -> 'protein_max') = 'number' then v_protein_max := (v_filters ->> 'protein_max')::numeric; end if;
  if jsonb_typeof(v_filters -> 'carbs_min') = 'number' then v_carbs_min := (v_filters ->> 'carbs_min')::numeric; end if;
  if jsonb_typeof(v_filters -> 'carbs_max') = 'number' then v_carbs_max := (v_filters ->> 'carbs_max')::numeric; end if;
  if jsonb_typeof(v_filters -> 'fat_min') = 'number' then v_fat_min := (v_filters ->> 'fat_min')::numeric; end if;
  if jsonb_typeof(v_filters -> 'fat_max') = 'number' then v_fat_max := (v_filters ->> 'fat_max')::numeric; end if;
  if jsonb_typeof(v_filters -> 'fiber_min') = 'number' then v_fiber_min := (v_filters ->> 'fiber_min')::numeric; end if;
  if jsonb_typeof(v_filters -> 'fiber_max') = 'number' then v_fiber_max := (v_filters ->> 'fiber_max')::numeric; end if;
  if jsonb_typeof(v_filters -> 'nutritional_score_min') = 'number' then v_score_min := (v_filters ->> 'nutritional_score_min')::numeric; end if;
  if jsonb_typeof(v_filters -> 'nutritional_score_max') = 'number' then v_score_max := (v_filters ->> 'nutritional_score_max')::numeric; end if;
  if jsonb_typeof(v_filters -> 'servings_min') = 'number' then v_servings_min := greatest(1, (v_filters ->> 'servings_min')::integer); end if;
  if jsonb_typeof(v_filters -> 'servings_max') = 'number' then v_servings_max := greatest(1, (v_filters ->> 'servings_max')::integer); end if;

  if jsonb_typeof(v_filters -> 'ingredient_kcal_min') = 'number' then v_ingredient_kcal_min := (v_filters ->> 'ingredient_kcal_min')::numeric; end if;
  if jsonb_typeof(v_filters -> 'ingredient_kcal_max') = 'number' then v_ingredient_kcal_max := (v_filters ->> 'ingredient_kcal_max')::numeric; end if;
  if jsonb_typeof(v_filters -> 'ingredient_protein_min') = 'number' then v_ingredient_protein_min := (v_filters ->> 'ingredient_protein_min')::numeric; end if;
  if jsonb_typeof(v_filters -> 'ingredient_protein_max') = 'number' then v_ingredient_protein_max := (v_filters ->> 'ingredient_protein_max')::numeric; end if;
  if jsonb_typeof(v_filters -> 'ingredient_carbs_min') = 'number' then v_ingredient_carbs_min := (v_filters ->> 'ingredient_carbs_min')::numeric; end if;
  if jsonb_typeof(v_filters -> 'ingredient_carbs_max') = 'number' then v_ingredient_carbs_max := (v_filters ->> 'ingredient_carbs_max')::numeric; end if;
  if jsonb_typeof(v_filters -> 'ingredient_fat_min') = 'number' then v_ingredient_fat_min := (v_filters ->> 'ingredient_fat_min')::numeric; end if;
  if jsonb_typeof(v_filters -> 'ingredient_fat_max') = 'number' then v_ingredient_fat_max := (v_filters ->> 'ingredient_fat_max')::numeric; end if;
  if jsonb_typeof(v_filters -> 'ingredient_fiber_min') = 'number' then v_ingredient_fiber_min := (v_filters ->> 'ingredient_fiber_min')::numeric; end if;
  if jsonb_typeof(v_filters -> 'ingredient_fiber_max') = 'number' then v_ingredient_fiber_max := (v_filters ->> 'ingredient_fiber_max')::numeric; end if;

  v_recipe_filters_active :=
    cardinality(v_categories) > 0
    or cardinality(v_meals) > 0
    or cardinality(v_components) > 0
    or cardinality(v_ingredients_include) > 0
    or cardinality(v_ingredients_exclude) > 0
    or cardinality(v_access) > 0
    or cardinality(v_cultural_profiles) > 0
    or cardinality(v_badges) > 0
    or cardinality(v_excluded_meals) > 0
    or cardinality(v_excluded_components) > 0
    or cardinality(v_menu_function_roles) > 0
    or cardinality(v_service_modes) > 0
    or cardinality(v_cultural_intents) > 0
    or cardinality(v_taste_profiles) > 0
    or cardinality(v_component_profiles) > 0
    or cardinality(v_texture_profiles) > 0
    or v_time_min is not null or v_time_max is not null
    or v_kcal_min is not null or v_kcal_max is not null
    or v_protein_min is not null or v_protein_max is not null
    or v_carbs_min is not null or v_carbs_max is not null
    or v_fat_min is not null or v_fat_max is not null
    or v_fiber_min is not null or v_fiber_max is not null
    or v_score_min is not null or v_score_max is not null
    or v_servings_min is not null or v_servings_max is not null;

  v_ingredient_filters_active :=
    cardinality(v_ingredient_categories) > 0
    or cardinality(v_matrix_families) > 0
    or cardinality(v_ingredient_states) > 0
    or cardinality(v_processing_types) > 0
    or v_ingredient_kcal_min is not null or v_ingredient_kcal_max is not null
    or v_ingredient_protein_min is not null or v_ingredient_protein_max is not null
    or v_ingredient_carbs_min is not null or v_ingredient_carbs_max is not null
    or v_ingredient_fat_min is not null or v_ingredient_fat_max is not null
    or v_ingredient_fiber_min is not null or v_ingredient_fiber_max is not null;

  return query
  with recursive
  current_routes as (
    select distinct on (r.object_type, r.object_id)
      r.object_type,
      r.object_id,
      r.owner_id,
      nullif(lower(regexp_replace(coalesce(r.handle, ''), '^@', '')), '') as handle,
      r.slug,
      i.title as identity_title
    from home.cookshare_public_routes r
    join home.cookshare_public_identities i
      on i.object_type = r.object_type
     and i.object_id = r.object_id
    left join menu.recipes official_recipe
      on official_recipe.id = r.object_id
     and r.object_type = 'recipe'
    left join users.user_preferences up
      on up.user_id = i.owner_id
    where r.is_current
      and r.route_kind = 'current'
      and i.lifecycle = 'active'
      and not coalesce(i.admin_disabled, false)
      and (v_handle is null or nullif(lower(regexp_replace(coalesce(r.handle, ''), '^@', '')), '') = v_handle)
      and (
        (r.object_type = 'recipe' and official_recipe.origin::text = 'official' and official_recipe.source_recipe_id is null)
        or r.object_type in ('ingredient', 'category')
        or (i.publication_override is not null and i.publication_override)
        or (i.publication_override is null and coalesce(up.cookshare_public_by_default, false))
      )
    order by r.object_type, r.object_id, r.created_at desc
  ),
  selected_category_tree as (
    select c.id, c.parent_id, lower(c.slug) as selected_root
    from menu.recipe_categories c
    where lower(c.slug) = any(v_categories)
    union all
    select child.id, child.parent_id, tree.selected_root
    from menu.recipe_categories child
    join selected_category_tree tree on child.parent_id = tree.id
  ),
  recipe_ingredient_data as (
    select
      rci.recipe_id,
      array_agg(distinct
        case when v_locale = 'en'
          then coalesce(nullif(i.name_en, ''), i.name)
          else coalesce(nullif(i.name, ''), i.name_en)
        end
        order by case when v_locale = 'en'
          then coalesce(nullif(i.name_en, ''), i.name)
          else coalesce(nullif(i.name, ''), i.name_en)
        end
      ) filter (where coalesce(nullif(i.name, ''), nullif(i.name_en, '')) is not null) as display_names,
      array_agg(distinct keys.key order by keys.key) filter (where nullif(keys.key, '') is not null) as search_keys,
      string_agg(distinct keys.key, ' ') filter (where nullif(keys.key, '') is not null) as aux_text
    from menu.recipe_composition_ingredients rci
    join nutrition.ingredients i on i.id = rci.ingredient_id
    cross join lateral (
      values
        (regexp_replace(lower(public.unaccent(regexp_replace(coalesce(i.name, ''), '[^[:alnum:][:space:]-]+', ' ', 'g'))), '[-\s]+', ' ', 'g')),
        (regexp_replace(lower(public.unaccent(regexp_replace(coalesce(i.name_en, ''), '[^[:alnum:][:space:]-]+', ' ', 'g'))), '[-\s]+', ' ', 'g')),
        (regexp_replace(lower(public.unaccent(regexp_replace(coalesce(i.search_slug, ''), '[^[:alnum:][:space:]-]+', ' ', 'g'))), '[-\s]+', ' ', 'g'))
    ) keys(key)
    group by rci.recipe_id
    having v_query_normalized is not null
        or cardinality(v_ingredients_include) > 0
        or cardinality(v_ingredients_exclude) > 0
  ),
  recipe_category_data as (
    select
      a.recipe_id,
      array_agg(distinct c.id) as category_ids,
      min(coalesce(c.sort_order, 999999))::integer as category_sort_order,
      string_agg(distinct concat_ws(' ',
        regexp_replace(lower(public.unaccent(coalesce(c.name, ''))), '\s+', ' ', 'g'),
        regexp_replace(lower(public.unaccent(coalesce(c.name_en, ''))), '\s+', ' ', 'g'),
        regexp_replace(lower(public.unaccent(replace(coalesce(c.slug, ''), '-', ' '))), '\s+', ' ', 'g')
      ), ' ') as aux_text
    from menu.recipe_category_assignments a
    join menu.recipe_categories c on c.id = any(a.category_ids)
    group by a.recipe_id
  ),
  recipe_candidates as (
    select
      'recipe'::text as object_type,
      r.id as object_id,
      cr.owner_id,
      cr.handle,
      cr.slug,
      case when v_locale = 'en'
        then coalesce(nullif(r.title_en, ''), r.title, cr.identity_title, cr.slug)
        else coalesce(nullif(r.title, ''), r.title_en, cr.identity_title, cr.slug)
      end as title,
      coalesce(nullif(r.title_en, ''), nullif(r.title, ''), cr.identity_title, cr.slug) as title_en,
      case when v_locale = 'en' then coalesce(nullif(r.description_en, ''), r.description) else coalesce(nullif(r.description, ''), r.description_en) end as description,
      coalesce(nullif(r.description_en, ''), r.description) as description_en,
      r.cover_photo_url as image_url,
      coalesce(r.is_free_recipe, false) as is_free,
      nullif(rte.total_minutes_avg, 0)::integer as time_minutes,
      case when rnp.recipe_id is null then null else jsonb_build_object(
        'kcal', rnp.calories,
        'protein_g', rnp.protein_g,
        'carbs_g', rnp.carbs_g,
        'fat_g', rnp.fat_g,
        'fiber_g', rnp.fiber_g,
        'nutritional_score', rnp.nutritional_score,
        'badges', coalesce(to_jsonb(rnp.recipe_nutritional_tags), '[]'::jsonb)
      ) end as nutrition,
      rr.component_type::text as component,
      rr.slot_profile,
      coalesce(rid.display_names, '{}'::text[]) as ingredients,
      regexp_replace(lower(public.unaccent(coalesce(r.title, ''))), '\s+', ' ', 'g') as norm_1,
      regexp_replace(lower(public.unaccent(coalesce(r.title_en, ''))), '\s+', ' ', 'g') as norm_2,
      regexp_replace(lower(public.unaccent(replace(coalesce(r.canonical_name, ''), '_', ' '))), '\s+', ' ', 'g') as norm_3,
      regexp_replace(lower(public.unaccent(coalesce(rr.title, ''))), '\s+', ' ', 'g') as norm_4,
      regexp_replace(lower(public.unaccent(replace(coalesce(rr.canonical_name, ''), '_', ' '))), '\s+', ' ', 'g') as norm_5,
      regexp_replace(lower(public.unaccent(coalesce(r.title, ''))), '\s+', '', 'g') as dense_1,
      regexp_replace(lower(public.unaccent(coalesce(r.title_en, ''))), '\s+', '', 'g') as dense_2,
      regexp_replace(lower(public.unaccent(replace(coalesce(r.canonical_name, ''), '_', ' '))), '\s+', '', 'g') as dense_3,
      regexp_replace(lower(public.unaccent(coalesce(rr.title, ''))), '\s+', '', 'g') as dense_4,
      regexp_replace(lower(public.unaccent(replace(coalesce(rr.canonical_name, ''), '_', ' '))), '\s+', '', 'g') as dense_5,
      concat_ws(' ', rid.aux_text, rcd.aux_text) as aux_text,
      10::integer as object_priority,
      case
        when rr.home_status::text = 'core' then 1
        when rr.home_status::text = 'explore' then 2
        when rr.home_status is null then 3
        when rr.home_status::text = 'exclude' then 4
        else 3
      end::integer as eligibility_bucket_order,
      case rr.core_kind::text
        when 'sacred_loved' then 0
        when 'iconic' then 1
        when 'daily' then 2
        when 'none' then 3
        else 4
      end::integer as cultural_priority,
      (
        case
          when rr.home_status::text = 'core' then 28
          when rr.home_status::text = 'explore' then 14
          when rr.home_status is null then 8
          when rr.home_status::text = 'exclude' then -8
          else 0
        end
        + case
            when rr.core_kind::text = 'daily' then 6
            when rr.core_kind::text = 'iconic' then 5
            else 0
          end
        + coalesce(rnp.nutritional_score, 0)
      )::numeric as status_base_score,
      coalesce(rcd.category_sort_order, 999999)::integer as category_sort_order
    from current_routes cr
    join menu.recipes r on r.id = cr.object_id and cr.object_type = 'recipe'
    left join home.recipe_registry rr on rr.recipe_id = r.id
    left join menu.recipe_time_estimates rte on rte.recipe_id = r.id
    left join menu.recipe_nutritional_profiles rnp on rnp.recipe_id = r.id
    left join recipe_ingredient_data rid on rid.recipe_id = r.id
    left join recipe_category_data rcd on rcd.recipe_id = r.id
    left join home.mesa_recipe_sensory_cache sensory
      on sensory.recipe_id = r.id
     and cardinality(v_texture_profiles) > 0
    where v_type in ('all','recipes')
      and not v_ingredient_filters_active
      and (
        cardinality(v_categories) = 0
        or exists (
          select 1
          from selected_category_tree tree
          where tree.id = any(coalesce(rcd.category_ids, '{}'::uuid[]))
        )
      )
      -- Positive Gallery meal moment uses the same 0.50 threshold as rpc_discover_recipes search filtering.
      and (
        cardinality(v_meals) = 0
        or exists (
          select 1 from unnest(v_meals) wanted(moment_key)
          where coalesce(nullif(rr.slot_profile ->> wanted.moment_key, '')::numeric, 0) >= 0.50
        )
      )
      and (cardinality(v_components) = 0 or rr.component_type::text = any(v_components))
      and (
        cardinality(v_texture_profiles) = 0
        or exists (
          select 1
          from unnest(v_texture_profiles) selected(key)
          where lower(coalesce(sensory.texture_primary_raw, '')) = selected.key
             or lower(coalesce(sensory.texture_secondary_raw, '')) = selected.key
        )
      )
      and (
        v_time_min is null
        or (nullif(rte.total_minutes_avg, 0) is not null and rte.total_minutes_avg >= v_time_min)
      )
      and (
        v_time_max is null
        or (nullif(rte.total_minutes_avg, 0) is not null and rte.total_minutes_avg <= v_time_max)
      )
      and (
        cardinality(v_access) = 0
        or cardinality(v_access) = 2
        or ('free' = any(v_access) and coalesce(r.is_free_recipe, false))
        or ('pro' = any(v_access) and not coalesce(r.is_free_recipe, false))
      )
      -- Included ingredient chips are cumulative constraints: every included ingredient must exist.
      and not exists (
        select 1 from unnest(v_ingredients_include) wanted(key)
        where not (wanted.key = any(coalesce(rid.search_keys, '{}'::text[])))
      )
      and not exists (
        select 1 from unnest(v_ingredients_exclude) blocked(key)
        where blocked.key = any(coalesce(rid.search_keys, '{}'::text[]))
      )
      -- CookSearch canonical excluded meal semantics: exact live threshold 0.50.
      and not exists (
        select 1 from unnest(v_excluded_meals) selected(key)
        where coalesce(nullif(rr.slot_profile ->> selected.key, '')::numeric, 0) >= 0.50
      )
      and (cardinality(v_excluded_components) = 0 or rr.component_type::text <> all(v_excluded_components))
      -- CookSearch canonical menu-function thresholds.
      and (
        cardinality(v_menu_function_roles) = 0
        or exists (
          select 1 from unnest(v_menu_function_roles) selected(key)
          where coalesce(nullif(rr.menu_function_profile ->> selected.key, '')::numeric, 0) >=
            case selected.key
              when 'anchor' then 0.70
              when 'support' then 0.70
              when 'cut' then 0.55
              when 'refresh' then 0.55
              when 'close' then 0.65
              else 999
            end
        )
      )
      -- CookSearch canonical service thresholds.
      and (
        cardinality(v_service_modes) = 0
        or exists (
          select 1 from unnest(v_service_modes) selected(key)
          where coalesce(nullif(rr.service_profile ->> selected.key, '')::numeric, 0) >=
            case selected.key
              when 'hot' then 0.70
              when 'warm' then 0.65
              when 'cold' then 0.65
              when 'room_temp' then 0.55
              when 'refreshing' then 0.60
              when 'digestive' then 0.55
              else 999
            end
        )
      )
      -- CookSearch canonical cultural-intent semantics.
      and (
        cardinality(v_cultural_intents) = 0
        or exists (
          select 1 from unnest(v_cultural_intents) selected(key)
          where
            (selected.key = 'sacred_loved' and (rr.core_kind::text = 'sacred_loved' or coalesce(nullif(rr.cultural_profile ->> 'sacred_loved', '')::numeric, 0) >= 0.80))
            or (selected.key = 'iconic' and (rr.core_kind::text = 'iconic' or coalesce(nullif(rr.cultural_profile ->> 'iconic', '')::numeric, 0) >= 0.80))
            or (selected.key = 'daily' and (rr.core_kind::text = 'daily' or coalesce(nullif(rr.cultural_profile ->> 'daily', '')::numeric, 0) >= 0.70))
            or (selected.key = 'explore' and rr.home_status::text in ('explore','exclude'))
        )
      )
      -- Gallery cultural profile/intensity extends the same canonical thresholds with exact core_kind=none.
      and (
        cardinality(v_cultural_profiles) = 0
        or exists (
          select 1 from unnest(v_cultural_profiles) selected(key)
          where
            (selected.key = 'sacred_loved' and (rr.core_kind::text = 'sacred_loved' or coalesce(nullif(rr.cultural_profile ->> 'sacred_loved', '')::numeric, 0) >= 0.80))
            or (selected.key = 'iconic' and (rr.core_kind::text = 'iconic' or coalesce(nullif(rr.cultural_profile ->> 'iconic', '')::numeric, 0) >= 0.80))
            or (selected.key = 'daily' and (rr.core_kind::text = 'daily' or coalesce(nullif(rr.cultural_profile ->> 'daily', '')::numeric, 0) >= 0.70))
            or (selected.key = 'none' and rr.core_kind::text = 'none')
        )
      )
      -- CookSearch canonical taste thresholds.
      and (
        cardinality(v_taste_profiles) = 0
        or exists (
          select 1 from unnest(v_taste_profiles) selected(key)
          where
            (selected.key in ('sweet','salty','umami') and coalesce(nullif(r.sensory_profile_cooked -> 'taste' ->> selected.key, '')::numeric, 0) >= 6)
            or (selected.key in ('sour','spicy') and coalesce(nullif(r.sensory_profile_cooked -> 'taste' ->> selected.key, '')::numeric, 0) >= 5)
            or (selected.key = 'low_bitter' and r.sensory_profile_cooked -> 'taste' ? 'bitter' and coalesce(nullif(r.sensory_profile_cooked -> 'taste' ->> 'bitter', '')::numeric, 999) <= 2)
        )
      )
      -- CookSearch canonical component-profile thresholds.
      and (
        cardinality(v_component_profiles) = 0
        or exists (
          select 1 from unnest(v_component_profiles) selected(key)
          where coalesce(nullif(rr.component_profile ->> selected.key, '')::numeric, 0) >=
            case selected.key
              when 'main_dish' then 0.65
              when 'beverage' then 0.70
              when 'sauce' then 0.70
              when 'dessert' then 0.70
              when 'side_dish' then 0.65
              when 'appetizer' then 0.60
              when 'salad' then 0.70
              when 'dressing' then 0.70
              else 999
            end
        )
      )
      and (v_kcal_min is null or (rnp.recipe_id is not null and rnp.calories >= v_kcal_min))
      and (v_kcal_max is null or (rnp.recipe_id is not null and rnp.calories <= v_kcal_max))
      and (v_protein_min is null or (rnp.recipe_id is not null and rnp.protein_g >= v_protein_min))
      and (v_protein_max is null or (rnp.recipe_id is not null and rnp.protein_g <= v_protein_max))
      and (v_carbs_min is null or (rnp.recipe_id is not null and rnp.carbs_g >= v_carbs_min))
      and (v_carbs_max is null or (rnp.recipe_id is not null and rnp.carbs_g <= v_carbs_max))
      and (v_fat_min is null or (rnp.recipe_id is not null and rnp.fat_g >= v_fat_min))
      and (v_fat_max is null or (rnp.recipe_id is not null and rnp.fat_g <= v_fat_max))
      and (v_fiber_min is null or (rnp.recipe_id is not null and rnp.fiber_g >= v_fiber_min))
      and (v_fiber_max is null or (rnp.recipe_id is not null and rnp.fiber_g <= v_fiber_max))
      and (v_score_min is null or (rnp.recipe_id is not null and rnp.nutritional_score >= v_score_min))
      and (v_score_max is null or (rnp.recipe_id is not null and rnp.nutritional_score <= v_score_max))
      and (
        cardinality(v_badges) = 0
        or exists (
          select 1
          from unnest(coalesce(rnp.recipe_nutritional_tags::text[], '{}'::text[])) badge(key)
          where lower(badge.key) = any(v_badges)
        )
      )
      and (v_servings_min is null or (r.servings is not null and r.servings >= v_servings_min))
      and (v_servings_max is null or (r.servings is not null and r.servings <= v_servings_max))
  ),
  saved_candidates as (
    select
      s.item_type::text as object_type,
      s.id as object_id,
      cr.owner_id,
      cr.handle,
      cr.slug,
      coalesce(nullif(s.title, ''), cr.identity_title, cr.slug) as title,
      coalesce(nullif(s.title, ''), cr.identity_title, cr.slug) as title_en,
      null::text as description,
      null::text as description_en,
      cover.cover_photo_url as image_url,
      true as is_free,
      null::integer as time_minutes,
      s.nutrition_snapshot as nutrition,
      null::text as component,
      null::jsonb as slot_profile,
      '{}'::text[] as ingredients,
      regexp_replace(lower(public.unaccent(coalesce(s.title, cr.identity_title, cr.slug, ''))), '\s+', ' ', 'g') as norm_1,
      ''::text as norm_2,
      regexp_replace(lower(public.unaccent(replace(coalesce(cr.slug, ''), '-', ' '))), '\s+', ' ', 'g') as norm_3,
      ''::text as norm_4,
      ''::text as norm_5,
      regexp_replace(lower(public.unaccent(coalesce(s.title, cr.identity_title, cr.slug, ''))), '\s+', '', 'g') as dense_1,
      ''::text as dense_2,
      regexp_replace(lower(public.unaccent(replace(coalesce(cr.slug, ''), '-', ' '))), '\s+', '', 'g') as dense_3,
      ''::text as dense_4,
      ''::text as dense_5,
      ''::text as aux_text,
      case s.item_type::text when 'menu' then 20 when 'day' then 30 when 'week' then 40 else 90 end as object_priority,
      3::integer as eligibility_bucket_order,
      5::integer as cultural_priority,
      0::numeric as status_base_score,
      999999::integer as category_sort_order
    from current_routes cr
    join cookplan.saved_items s
      on s.id = cr.object_id
     and s.item_type::text = cr.object_type
     and s.deleted_at is null
    left join lateral (
      select r.cover_photo_url
      from unnest(home.fn_cookshare_extract_recipe_ids(s.content_snapshot)) with ordinality ids(recipe_id, ordinality)
      join menu.recipes r on r.id = ids.recipe_id
      where nullif(r.cover_photo_url, '') is not null
        and home.fn_cookshare_effective_public('recipe', r.id, null)
      order by ids.ordinality
      limit 1
    ) cover on true
    where cr.object_type in ('menu','day','week')
      and not v_recipe_filters_active
      and not v_ingredient_filters_active
      and (
        (v_type = 'all')
        or (v_type = 'menus' and cr.object_type = 'menu')
        or (v_type = 'days' and cr.object_type = 'day')
        or (v_type = 'weeks' and cr.object_type = 'week')
      )
  ),
  ingredient_candidates as (
    select
      'ingredient'::text as object_type,
      i.id as object_id,
      cr.owner_id,
      cr.handle,
      cr.slug,
      case when v_locale = 'en' then coalesce(nullif(i.name_en, ''), i.name, cr.identity_title, cr.slug) else coalesce(nullif(i.name, ''), i.name_en, cr.identity_title, cr.slug) end as title,
      coalesce(nullif(i.name_en, ''), i.name, cr.identity_title, cr.slug) as title_en,
      null::text as description,
      null::text as description_en,
      i.image_url,
      true as is_free,
      null::integer as time_minutes,
      jsonb_build_object(
        'kcal', i.calories,
        'protein_g', i.protein_g,
        'carbs_g', i.carbs_total_g,
        'fat_g', i.fat_total_g,
        'fiber_g', i.fiber_g
      ) as nutrition,
      null::text as component,
      null::jsonb as slot_profile,
      '{}'::text[] as ingredients,
      regexp_replace(lower(public.unaccent(coalesce(i.name, ''))), '\s+', ' ', 'g') as norm_1,
      regexp_replace(lower(public.unaccent(coalesce(i.name_en, ''))), '\s+', ' ', 'g') as norm_2,
      regexp_replace(lower(public.unaccent(replace(coalesce(i.search_slug, ''), '-', ' '))), '\s+', ' ', 'g') as norm_3,
      regexp_replace(lower(public.unaccent(coalesce(ic.name_es, ''))), '\s+', ' ', 'g') as norm_4,
      regexp_replace(lower(public.unaccent(coalesce(ic.name_en, ''))), '\s+', ' ', 'g') as norm_5,
      regexp_replace(lower(public.unaccent(coalesce(i.name, ''))), '\s+', '', 'g') as dense_1,
      regexp_replace(lower(public.unaccent(coalesce(i.name_en, ''))), '\s+', '', 'g') as dense_2,
      regexp_replace(lower(public.unaccent(replace(coalesce(i.search_slug, ''), '-', ' '))), '\s+', '', 'g') as dense_3,
      ''::text as dense_4,
      ''::text as dense_5,
      ''::text as aux_text,
      50::integer as object_priority,
      3::integer as eligibility_bucket_order,
      5::integer as cultural_priority,
      0::numeric as status_base_score,
      999999::integer as category_sort_order
    from current_routes cr
    join nutrition.ingredients i on i.id = cr.object_id and cr.object_type = 'ingredient'
    left join nutrition.ingredient_categories ic on ic.id = i.category_id
    where v_type in ('all','ingredients')
      and not v_recipe_filters_active
      and (
        cardinality(v_ingredient_categories) = 0
        or lower(coalesce(ic.code, '')) = any(v_ingredient_categories)
      )
      and (cardinality(v_matrix_families) = 0 or i.matrix_family::text = any(v_matrix_families))
      and (cardinality(v_ingredient_states) = 0 or i.state::text = any(v_ingredient_states))
      and (cardinality(v_processing_types) = 0 or i.nutritional_type::text = any(v_processing_types))
      and (v_ingredient_kcal_min is null or i.calories >= v_ingredient_kcal_min)
      and (v_ingredient_kcal_max is null or i.calories <= v_ingredient_kcal_max)
      and (v_ingredient_protein_min is null or i.protein_g >= v_ingredient_protein_min)
      and (v_ingredient_protein_max is null or i.protein_g <= v_ingredient_protein_max)
      and (v_ingredient_carbs_min is null or i.carbs_total_g >= v_ingredient_carbs_min)
      and (v_ingredient_carbs_max is null or i.carbs_total_g <= v_ingredient_carbs_max)
      and (v_ingredient_fat_min is null or i.fat_total_g >= v_ingredient_fat_min)
      and (v_ingredient_fat_max is null or i.fat_total_g <= v_ingredient_fat_max)
      and (v_ingredient_fiber_min is null or i.fiber_g >= v_ingredient_fiber_min)
      and (v_ingredient_fiber_max is null or i.fiber_g <= v_ingredient_fiber_max)
  ),
  category_candidates as (
    -- Internal enumeration compatibility (e.g. sitemap). Categories are not part of global `all` Gallery search.
    select
      'category'::text as object_type,
      c.id as object_id,
      cr.owner_id,
      cr.handle,
      cr.slug,
      case when v_locale = 'en' then coalesce(nullif(c.name_en, ''), c.name, cr.identity_title, cr.slug) else coalesce(nullif(c.name, ''), c.name_en, cr.identity_title, cr.slug) end as title,
      coalesce(nullif(c.name_en, ''), c.name, cr.identity_title, cr.slug) as title_en,
      null::text as description,
      null::text as description_en,
      c.cover_photo_url as image_url,
      true as is_free,
      null::integer as time_minutes,
      null::jsonb as nutrition,
      null::text as component,
      null::jsonb as slot_profile,
      '{}'::text[] as ingredients,
      regexp_replace(lower(public.unaccent(coalesce(c.name, ''))), '\s+', ' ', 'g') as norm_1,
      regexp_replace(lower(public.unaccent(coalesce(c.name_en, ''))), '\s+', ' ', 'g') as norm_2,
      regexp_replace(lower(public.unaccent(replace(coalesce(c.slug, ''), '-', ' '))), '\s+', ' ', 'g') as norm_3,
      ''::text as norm_4,
      ''::text as norm_5,
      regexp_replace(lower(public.unaccent(coalesce(c.name, ''))), '\s+', '', 'g') as dense_1,
      regexp_replace(lower(public.unaccent(coalesce(c.name_en, ''))), '\s+', '', 'g') as dense_2,
      regexp_replace(lower(public.unaccent(replace(coalesce(c.slug, ''), '-', ' '))), '\s+', '', 'g') as dense_3,
      ''::text as dense_4,
      ''::text as dense_5,
      ''::text as aux_text,
      60::integer as object_priority,
      3::integer as eligibility_bucket_order,
      5::integer as cultural_priority,
      0::numeric as status_base_score,
      999999::integer as category_sort_order
    from current_routes cr
    join menu.recipe_categories c on c.id = cr.object_id and cr.object_type = 'category'
    where v_type = 'categories'
      and not v_recipe_filters_active
      and not v_ingredient_filters_active
  ),
  list_candidates as (
    -- Internal enumeration compatibility only. Lists are intentionally NOT searchable.
    select
      'list'::text as object_type,
      l.id as object_id,
      cr.owner_id,
      cr.handle,
      cr.slug,
      coalesce(nullif(l.title, ''), 'CookList') as title,
      coalesce(nullif(l.title, ''), 'CookList') as title_en,
      null::text as description,
      null::text as description_en,
      null::text as image_url,
      true as is_free,
      null::integer as time_minutes,
      null::jsonb as nutrition,
      null::text as component,
      null::jsonb as slot_profile,
      '{}'::text[] as ingredients,
      regexp_replace(lower(public.unaccent(coalesce(l.title, 'CookList'))), '\s+', ' ', 'g') as norm_1,
      ''::text as norm_2,
      regexp_replace(lower(public.unaccent(replace(coalesce(cr.slug, ''), '-', ' '))), '\s+', ' ', 'g') as norm_3,
      ''::text as norm_4,
      ''::text as norm_5,
      regexp_replace(lower(public.unaccent(coalesce(l.title, 'CookList'))), '\s+', '', 'g') as dense_1,
      ''::text as dense_2,
      regexp_replace(lower(public.unaccent(replace(coalesce(cr.slug, ''), '-', ' '))), '\s+', '', 'g') as dense_3,
      ''::text as dense_4,
      ''::text as dense_5,
      ''::text as aux_text,
      70::integer as object_priority,
      3::integer as eligibility_bucket_order,
      5::integer as cultural_priority,
      0::numeric as status_base_score,
      999999::integer as category_sort_order
    from current_routes cr
    join cooklist.lists l on l.id = cr.object_id and cr.object_type = 'list'
    where v_type = 'lists'
      and v_query_normalized is null
      and not v_recipe_filters_active
      and not v_ingredient_filters_active
  ),
  object_candidates as (
    select * from recipe_candidates
    union all
    select * from saved_candidates
    union all
    select * from ingredient_candidates
    union all
    select * from category_candidates
    union all
    select * from list_candidates
  ),
  handle_candidates as (
    -- Navigational handle results may appear in text search, but handles are not a global type chip.
    select distinct on (cr.owner_id, cr.handle)
      'handle'::text as object_type,
      cr.owner_id as object_id,
      cr.owner_id,
      cr.handle,
      cr.handle as slug,
      '@' || cr.handle as title,
      '@' || cr.handle as title_en,
      null::text as description,
      null::text as description_en,
      null::text as image_url,
      true as is_free,
      null::integer as time_minutes,
      null::jsonb as nutrition,
      null::text as component,
      null::jsonb as slot_profile,
      '{}'::text[] as ingredients,
      regexp_replace(lower(public.unaccent(coalesce(cr.handle, ''))), '\s+', ' ', 'g') as norm_1,
      ''::text as norm_2,
      ''::text as norm_3,
      ''::text as norm_4,
      ''::text as norm_5,
      regexp_replace(lower(public.unaccent(coalesce(cr.handle, ''))), '\s+', '', 'g') as dense_1,
      ''::text as dense_2,
      ''::text as dense_3,
      ''::text as dense_4,
      ''::text as dense_5,
      ''::text as aux_text,
      80::integer as object_priority,
      3::integer as eligibility_bucket_order,
      5::integer as cultural_priority,
      0::numeric as status_base_score,
      999999::integer as category_sort_order
    from current_routes cr
    where cr.owner_id is not null
      and cr.handle is not null
      and v_query_normalized is not null
      and not v_recipe_filters_active
      and not v_ingredient_filters_active
      and v_type = 'handles'
    order by cr.owner_id, cr.handle
  ),
  candidates as (
    select * from object_candidates
    union all
    select * from handle_candidates
  ),
  scored as (
    select
      c.*,
      greatest(
        public.similarity(v_query_normalized, coalesce(c.norm_1, '')),
        public.similarity(v_query_normalized, coalesce(c.norm_2, '')),
        public.similarity(v_query_normalized, coalesce(c.norm_3, '')),
        public.similarity(v_query_normalized, coalesce(c.norm_4, '')),
        public.similarity(v_query_normalized, coalesce(c.norm_5, '')),
        public.similarity(coalesce(v_query_dense, ''), coalesce(c.dense_1, '')),
        public.similarity(coalesce(v_query_dense, ''), coalesce(c.dense_2, '')),
        public.similarity(coalesce(v_query_dense, ''), coalesce(c.dense_3, '')),
        public.similarity(coalesce(v_query_dense, ''), coalesce(c.dense_4, '')),
        public.similarity(coalesce(v_query_dense, ''), coalesce(c.dense_5, ''))
      ) as letter_similarity,
      greatest(
        public.word_similarity(v_query_normalized, coalesce(c.norm_1, '')),
        public.word_similarity(v_query_normalized, coalesce(c.norm_2, '')),
        public.word_similarity(v_query_normalized, coalesce(c.norm_3, '')),
        public.word_similarity(v_query_normalized, coalesce(c.norm_4, '')),
        public.word_similarity(v_query_normalized, coalesce(c.norm_5, ''))
      ) as word_letter_similarity,
      (v_query_normalized is not null and v_query_normalized in (c.norm_1,c.norm_2,c.norm_3,c.norm_4,c.norm_5)) as is_exact,
      (v_query_normalized is not null and (
        c.norm_1 like v_query_normalized || '%' or c.norm_2 like v_query_normalized || '%' or c.norm_3 like v_query_normalized || '%' or c.norm_4 like v_query_normalized || '%' or c.norm_5 like v_query_normalized || '%'
      )) as is_prefix,
      (v_query_normalized is not null and (
        c.norm_1 like '%' || v_query_normalized || '%' or c.norm_2 like '%' || v_query_normalized || '%' or c.norm_3 like '%' || v_query_normalized || '%' or c.norm_4 like '%' || v_query_normalized || '%' or c.norm_5 like '%' || v_query_normalized || '%'
      )) as is_contains,
      (v_query_normalized is not null and c.object_type = 'recipe' and coalesce(c.aux_text, '') like '%' || v_query_normalized || '%') as is_related
    from candidates c
  ),
  accepted as (
    select
      s.*,
      greatest(s.letter_similarity, s.word_letter_similarity) as best_similarity,
      case
        when v_query_normalized is null then 'filter'
        when s.is_exact then 'exact'
        when s.is_prefix then 'prefix'
        when s.is_contains then 'contains'
        when greatest(s.letter_similarity, s.word_letter_similarity) >= 0.22 then 'fuzzy'
        when s.is_related then 'related'
        else null
      end as resolved_match_type,
      case
        when v_query_normalized is null then 0::numeric
        else (
          greatest(s.letter_similarity, s.word_letter_similarity) * 100
          + case when s.is_exact then 100 else 0 end
          + case when s.is_prefix then 70 else 0 end
          + case when s.is_contains then 40 else 0 end
          + case when s.is_related then 10 else 0 end
        )::numeric
      end as query_score
    from scored s
    where
      v_query_normalized is null
      or s.is_exact
      or s.is_prefix
      or s.is_contains
      or greatest(s.letter_similarity, s.word_letter_similarity) >= 0.22
      or s.is_related
  ),
  sort_keys as (
    select
      s.*,
      jsonb_build_object(
        'm', s.sort_match_type,
        's', s.sort_similarity,
        'q', s.sort_query_score,
        'o', s.object_priority,
        'c', s.sort_component,
        'e', s.eligibility_bucket_order,
        'u', s.cultural_priority,
        'b', s.status_base_score,
        'k', s.category_sort_order,
        't', s.sort_title,
        'i', s.object_id::text,
        'y', s.object_type
      ) as sort_cursor
    from (
      select
        a.*,
      case when v_query_normalized is null then 0 else
        case a.resolved_match_type
          when 'exact' then 0
          when 'prefix' then 1
          when 'contains' then 2
          when 'fuzzy' then 3
          when 'related' then 4
          else 5
        end
      end as sort_match_type,
      case when v_query_normalized is not null then a.best_similarity else 0 end as sort_similarity,
      case when v_query_normalized is not null then a.query_score else 0 end as sort_query_score,
      case when a.object_type = 'recipe' then home.fn_cooksearch_component_type_sort_order(a.component) else 999 end as sort_component,
      coalesce(lower(public.unaccent(a.title)), '') as sort_title
      from accepted a
    ) s
  ),
  initial_ordered as (
    select
      s.*,
      count(*) over ()::bigint as total_count
    from sort_keys s
    where p_cursor is null
  ),
  cursor_ordered as (
    select
      s.*,
      null::bigint as total_count
    from sort_keys s
    where p_cursor is not null
      and v_cursor_valid
      and (
        s.sort_match_type > v_cursor_match_type
        or (s.sort_match_type = v_cursor_match_type and s.sort_similarity < v_cursor_similarity)
        or (s.sort_match_type = v_cursor_match_type and s.sort_similarity = v_cursor_similarity and s.sort_query_score < v_cursor_query_score)
        or (s.sort_match_type = v_cursor_match_type and s.sort_similarity = v_cursor_similarity and s.sort_query_score = v_cursor_query_score and s.object_priority > v_cursor_object_priority)
        or (s.sort_match_type = v_cursor_match_type and s.sort_similarity = v_cursor_similarity and s.sort_query_score = v_cursor_query_score and s.object_priority = v_cursor_object_priority and s.sort_component > v_cursor_component)
        or (s.sort_match_type = v_cursor_match_type and s.sort_similarity = v_cursor_similarity and s.sort_query_score = v_cursor_query_score and s.object_priority = v_cursor_object_priority and s.sort_component = v_cursor_component and s.eligibility_bucket_order > v_cursor_eligibility)
        or (s.sort_match_type = v_cursor_match_type and s.sort_similarity = v_cursor_similarity and s.sort_query_score = v_cursor_query_score and s.object_priority = v_cursor_object_priority and s.sort_component = v_cursor_component and s.eligibility_bucket_order = v_cursor_eligibility and s.cultural_priority > v_cursor_cultural)
        or (s.sort_match_type = v_cursor_match_type and s.sort_similarity = v_cursor_similarity and s.sort_query_score = v_cursor_query_score and s.object_priority = v_cursor_object_priority and s.sort_component = v_cursor_component and s.eligibility_bucket_order = v_cursor_eligibility and s.cultural_priority = v_cursor_cultural and s.status_base_score < v_cursor_status)
        or (s.sort_match_type = v_cursor_match_type and s.sort_similarity = v_cursor_similarity and s.sort_query_score = v_cursor_query_score and s.object_priority = v_cursor_object_priority and s.sort_component = v_cursor_component and s.eligibility_bucket_order = v_cursor_eligibility and s.cultural_priority = v_cursor_cultural and s.status_base_score = v_cursor_status and s.category_sort_order > v_cursor_category)
        or (s.sort_match_type = v_cursor_match_type and s.sort_similarity = v_cursor_similarity and s.sort_query_score = v_cursor_query_score and s.object_priority = v_cursor_object_priority and s.sort_component = v_cursor_component and s.eligibility_bucket_order = v_cursor_eligibility and s.cultural_priority = v_cursor_cultural and s.status_base_score = v_cursor_status and s.category_sort_order = v_cursor_category and s.sort_title > v_cursor_title)
        or (s.sort_match_type = v_cursor_match_type and s.sort_similarity = v_cursor_similarity and s.sort_query_score = v_cursor_query_score and s.object_priority = v_cursor_object_priority and s.sort_component = v_cursor_component and s.eligibility_bucket_order = v_cursor_eligibility and s.cultural_priority = v_cursor_cultural and s.status_base_score = v_cursor_status and s.category_sort_order = v_cursor_category and s.sort_title = v_cursor_title and s.object_id > v_cursor_object_id)
        or (s.sort_match_type = v_cursor_match_type and s.sort_similarity = v_cursor_similarity and s.sort_query_score = v_cursor_query_score and s.object_priority = v_cursor_object_priority and s.sort_component = v_cursor_component and s.eligibility_bucket_order = v_cursor_eligibility and s.cultural_priority = v_cursor_cultural and s.status_base_score = v_cursor_status and s.category_sort_order = v_cursor_category and s.sort_title = v_cursor_title and s.object_id = v_cursor_object_id and s.object_type > v_cursor_object_type)
      )
  ),
  ordered as (
    select * from initial_ordered
    union all
    select * from cursor_ordered
  ),
  paged as (
    select o.*
    from ordered o
    order by
      o.sort_match_type asc,
      o.sort_similarity desc,
      o.sort_query_score desc,
      o.object_priority asc,
      o.sort_component asc,
      o.eligibility_bucket_order asc,
      o.cultural_priority asc,
      o.status_base_score desc,
      o.category_sort_order asc,
      o.sort_title asc,
      o.object_id,
      o.object_type
    limit v_limit
  )
  select
    p.object_type,
    p.object_id,
    p.owner_id,
    p.handle,
    p.slug,
    p.title,
    p.title_en,
    p.description,
    p.description_en,
    p.image_url,
    p.is_free,
    p.time_minutes,
    p.nutrition,
    null::integer as rank,
    p.component,
    p.slot_profile,
    p.ingredients,
    p.resolved_match_type as match_type,
    p.query_score as relevance_score,
    p.total_count,
    p.sort_cursor as cursor
  from paged p
  order by
    p.sort_match_type asc,
    p.sort_similarity desc,
    p.sort_query_score desc,
    p.object_priority asc,
    p.sort_component asc,
    p.eligibility_bucket_order asc,
    p.cultural_priority asc,
    p.status_base_score desc,
    p.category_sort_order asc,
    p.sort_title asc,
    p.object_id,
    p.object_type;
end;
$function$;

comment on function home.rpc_cookshare_gallery_candidates(
  text, text, text, text,
  text[], text[], text[], text[], text[],
  integer, integer, text, integer, jsonb, jsonb
) is
'Definitive CookShare public Gallery search/filter RPC. Searches the full authoritative public catalog; never uses cookmatch_recipe_bank. Text relevance copies CookSearch exact/prefix/contains/fuzzy matching. Semantic recipe filters copy canonical CookSearch thresholds.';

-- Security-definer RPC: do not inherit PostgreSQL's default PUBLIC execute privilege.
revoke execute on function home.rpc_cookshare_gallery_candidates(
  text, text, text, text,
  text[], text[], text[], text[], text[],
  integer, integer, text, integer, jsonb, jsonb
) from public;

grant execute on function home.rpc_cookshare_gallery_candidates(
  text, text, text, text,
  text[], text[], text[], text[], text[],
  integer, integer, text, integer, jsonb, jsonb
) to anon, authenticated, service_role;

commit;
