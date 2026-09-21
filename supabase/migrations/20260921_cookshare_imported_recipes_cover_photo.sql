-- Migration: 20260921_cookshare_imported_recipes_cover_photo.sql
-- Fix: Support imported recipes image resolution across CookShare projections and cards.
-- Imported recipes (origin = 'imported') have cover_photo_url as NULL and store
-- user-uploaded media in user_image_urls (text[]).
-- We coalesce(cover_photo_url, user_image_urls[1]) so that imported recipe images
-- are properly surfaced across CookShare public projections, contextual recipes,
-- daily/weekly menus, and gallery search.

-- 1. Update cookplan.fn_menu_card_from_instance
CREATE OR REPLACE FUNCTION cookplan.fn_menu_card_from_instance(p_menu jsonb)
 RETURNS jsonb
 LANGUAGE sql
 SET search_path TO 'cookplan', 'public'
AS $function$
  with components_raw as (
    select
      c.value ->> 'id' as component_id,
      case
        when (c.value ->> 'position') ~ '^[0-9]+$'
          then (c.value ->> 'position')::int
        else c.ordinality::int
      end as position,
      c.value ->> 'component_type' as component_type,
      r.id::text as recipe_id,
      r.source_recipe_id::text as source_recipe_id,
      r.origin::text as recipe_origin,
      r.title,
      r.title_en,
      coalesce(r.canonical_name, r.title) as canonical_name,
      coalesce(r.cover_photo_url, r.user_image_urls[1]) as image_url,
      r.cost_tier::text as cost_tier,
      greatest(coalesce(r.servings, 1), 1) as base_servings,
      case
        when jsonb_typeof(c.value -> 'billable_servings') = 'number'
          then greatest((c.value ->> 'billable_servings')::numeric, 1)
        else greatest(coalesce(r.servings, 1), 1)::numeric
      end as billable_servings,
      case
        when jsonb_typeof(c.value -> 'servings') = 'number'
          then greatest((c.value ->> 'servings')::numeric, 1)
        else greatest(coalesce(r.servings, 1), 1)::numeric
      end as recommended_servings,
      c.value -> 'scaling_mode' as scaling_mode,
      c.value -> 'min_billable_servings' as min_billable_servings,
      c.value -> 'recommended_scale_factor' as recommended_scale_factor,
      rte.total_minutes_avg,
      rte.active_minutes_avg,
      rte.passive_minutes_avg,
      rte.optional_passive_minutes,
      coalesce(rfp.min_price_pen, 0)::numeric as min_price_pen,
      coalesce(nullif(rfp.max_price_pen, 0), rfp.min_price_pen, 0)::numeric
        as max_price_pen,
      coalesce(
        rfp.median_delivery_price_pen,
        rfp.min_delivery_price_pen,
        rfp.max_delivery_price_pen,
        rfp.median_restaurant_price_pen,
        rfp.min_restaurant_price_pen,
        rfp.max_restaurant_price_pen
      )::numeric as full_external_pen
    from jsonb_array_elements(cookplan.fn_array_or_empty(p_menu -> 'components'))
      with ordinality as c(value, ordinality)
    join menu.recipes r
      on r.id = case
        when cookplan.fn_is_uuid_text(c.value ->> 'recipe_id')
          then (c.value ->> 'recipe_id')::uuid
        else null::uuid
      end
    left join menu.recipe_time_estimates rte
      on rte.recipe_id = r.id
    left join menu.recipe_financial_profiles rfp
      on rfp.recipe_id = r.id
  ),
  priced_components as (
    select
      cr.*,
      (
        (
          coalesce(cr.min_price_pen, 0) +
          coalesce(cr.max_price_pen, cr.min_price_pen, 0)
        ) / 2.0
      )::numeric as full_home_pen
    from components_raw cr
  ),
  components as (
    select coalesce(
      jsonb_agg(
        jsonb_build_object(
          'component_id', cr.component_id,
          'position', cr.position,
          'component_type', cr.component_type,
          'recipe_id', cr.recipe_id,
          'source_recipe_id', cr.source_recipe_id,
          'recipe_origin', cr.recipe_origin,
          'title', cr.title,
          'title_en', cr.title_en,
          'canonical_name', cr.canonical_name,
          'image_url', cr.image_url,
          'pricing', jsonb_build_object(
            'display_mode', 'tier',
            'tier', cr.cost_tier,
            'min_pen', round(
              cr.full_home_pen *
              (cr.billable_servings / greatest(cr.base_servings, 1)::numeric),
              2
            ),
            'max_pen', round(
              cr.full_home_pen *
              (cr.billable_servings / greatest(cr.base_servings, 1)::numeric),
              2
            ),
            'full_home_pen', round(cr.full_home_pen, 2),
            'effective_home_pen', round(
              cr.full_home_pen *
              (cr.billable_servings / greatest(cr.base_servings, 1)::numeric),
              2
            ),
            'full_external_pen', case
              when cr.full_external_pen is null then null
              else round(cr.full_external_pen, 2)
            end,
            'effective_external_pen', case
              when cr.full_external_pen is null then null
              else round(
                cr.full_external_pen *
                (cr.recommended_servings / greatest(cr.base_servings, 1)::numeric),
                2
              )
            end,
            'effective_savings_pen', case
              when cr.full_external_pen is null then null
              else round(
                (
                  cr.full_external_pen *
                  (cr.recommended_servings / greatest(cr.base_servings, 1)::numeric)
                ) - (
                  cr.full_home_pen *
                  (cr.billable_servings / greatest(cr.base_servings, 1)::numeric)
                ),
                2
              )
            end
          ),
          'time', jsonb_build_object(
            'active_minutes', cr.active_minutes_avg::integer,
            'passive_minutes', case
              when cr.passive_minutes_avg is null
                or cr.optional_passive_minutes is null
                then null
              else greatest(
                cr.passive_minutes_avg - cr.optional_passive_minutes,
                0
              )::integer
            end,
            'total_minutes', case
              when cr.total_minutes_avg is null
                or cr.optional_passive_minutes is null
                or cr.active_minutes_avg is null
                then null
              else greatest(
                cr.total_minutes_avg - cr.optional_passive_minutes,
                cr.active_minutes_avg
              )::integer
            end
          ),
          'badges', '[]'::jsonb,
          'base_servings', cr.base_servings,
          'billable_servings', cr.billable_servings,
          'recommended_servings', cr.recommended_servings,
          'scaling_mode', cr.scaling_mode,
          'min_billable_servings', cr.min_billable_servings,
          'recommended_scale_factor', cr.recommended_scale_factor
        )
        order by
          case cr.component_type
            when 'main_dish' then 1
            when 'salad' then 2
            when 'beverage' then 3
            when 'dessert' then 4
            when 'sauce' then 5
            when 'appetizer' then 6
            when 'side_dish' then 7
            else 99
          end,
          cr.position
      ),
      '[]'::jsonb
    ) as value
    from priced_components cr
  ),
  card_time_parts as (
    select
      count(*) as component_count,
      count(comp.value #>> '{time,active_minutes}') as active_count,
      count(comp.value #>> '{time,passive_minutes}') as passive_count,
      sum((comp.value #>> '{time,active_minutes}')::integer) as active_minutes,
      max((comp.value #>> '{time,passive_minutes}')::integer) as passive_minutes
    from jsonb_array_elements((select value from components)) as comp(value)
  ),
  card_time as (
    select jsonb_build_object(
      'active_minutes',
        case
          when component_count > 0 and active_count = component_count
            then active_minutes
          else null
        end,
      'passive_minutes',
        case
          when component_count > 0 and passive_count = component_count
            then passive_minutes
          else null
        end,
      'total_minutes',
        case
          when component_count > 0
            and active_count = component_count
            and passive_count = component_count
            then active_minutes + passive_minutes
          else null
        end
    ) as value
    from card_time_parts
  ),
  card_pricing as (
    select home.fn_mesa_materialize_menu_parts(
      (select value from components)
    ) -> 'pricing' as value
  )
  select jsonb_build_object(
    'card_id', p_menu ->> 'id',
    'menu_id', p_menu ->> 'id',
    'rank', 1,
    'result_type', 'cookplan',
    'display_title', coalesce(
      nullif(btrim(coalesce(p_menu ->> 'title', '')), ''),
      (
        select string_agg(value ->> 'title', ' + ' order by (value ->> 'position')::int)
        from jsonb_array_elements((select value from components))
          as component(value)
      )
    ),
    'display_title_en', (
      select string_agg(value ->> 'title_en', ' + ' order by (value ->> 'position')::int)
      from jsonb_array_elements((select value from components))
        as component(value)
      where nullif(btrim(coalesce(value ->> 'title_en', '')), '') is not null
    ),
    'hero_image_url', (
      select value ->> 'image_url'
      from jsonb_array_elements((select value from components))
        as component(value)
      where nullif(btrim(coalesce(value ->> 'image_url', '')), '') is not null
      limit 1
    ),
    'display_servings', null,
    'display_scale_factor', null,
    'pricing', (select value from card_pricing),
    'time', (select value from card_time),
    'badges', '[]'::jsonb,
    'components', (select value from components)
  );
$function$;

-- 2. Update home.fn_cookshare_public_recipe_projection
CREATE OR REPLACE FUNCTION home.fn_cookshare_public_recipe_projection(p_recipe_id uuid, p_language_code text DEFAULT 'es'::text)
 RETURNS jsonb
 LANGUAGE plpgsql
 STABLE SECURITY DEFINER
 SET search_path TO 'home', 'public', 'menu', 'nutrition'
AS $function$
declare
  v_recipe menu.recipes%rowtype;
  v_lang text := lower(left(coalesce(nullif(trim(p_language_code), ''), 'es'), 2));
  v_ingredients jsonb;
  v_steps jsonb;
  v_nutrition jsonb;
  v_time jsonb;
  v_identity jsonb;
  v_is_public boolean := false;
begin
  select *
    into v_recipe
  from menu.recipes r
  where r.id = p_recipe_id;

  if not found then
    return null;
  end if;

  select jsonb_build_object(
    'active_minutes', coalesce(t.active_minutes_avg, t.total_minutes_avg, 0),
    'passive_minutes', coalesce(t.passive_minutes_avg, greatest(coalesce(t.total_minutes_avg, 0) - coalesce(t.active_minutes_avg, 0), 0), 0),
    'total_minutes', coalesce(t.total_minutes_avg, t.active_minutes_avg, 0)
  )
    into v_time
  from menu.recipe_time_estimates t
  where t.recipe_id = p_recipe_id;

  v_time := coalesce(
    v_time,
    jsonb_build_object('active_minutes',0,'passive_minutes',0,'total_minutes',0)
  );

  select jsonb_build_object(
    'kcal', n.calories,
    'protein_g', n.protein_g,
    'carbs_g', n.carbs_g,
    'fat_g', n.fat_g,
    'fiber_g', n.fiber_g
  )
    into v_nutrition
  from menu.recipe_nutritional_profiles n
  where n.recipe_id = p_recipe_id;

  select coalesce(
    jsonb_agg(
      jsonb_build_object(
        'ingredient_name', coalesce(
          nullif(case when v_lang='en' then i.name_en else i.name end,''),
          i.name,
          i.name_en
        ),
        'quantity', x.quantity,
        'unit', x.unit::text,
        'display_quantity', x.display_quantity,
        'display_unit', x.display_unit::text,
        'is_optional', coalesce(x.is_optional,false)
      )
      order by x.id
    ),
    '[]'::jsonb
  )
    into v_ingredients
  from menu.recipe_composition_ingredients x
  left join nutrition.ingredients i on i.id = x.ingredient_id
  where x.recipe_id = p_recipe_id;

  select coalesce(
    jsonb_agg(
      jsonb_build_object(
        'step_number', s.step_number,
        'instruction', case
          when v_lang='en' then coalesce(nullif(s.instruction_en,''),s.instruction)
          else coalesce(nullif(s.instruction,''),s.instruction_en)
        end
      )
      order by s.step_number, s.id
    ),
    '[]'::jsonb
  )
    into v_steps
  from menu.recipe_steps s
  where s.recipe_id = p_recipe_id;

  v_is_public := home.fn_cookshare_effective_public('recipe', p_recipe_id, null);

  select jsonb_build_object(
    'object_type', 'recipe',
    'handle', r.handle,
    'slug', r.slug,
    'canonical_path', case
      when v_is_public
        then home.fn_cookshare_path(v_lang, 'recipe', r.handle, r.slug)
      else null
    end,
    'is_public', v_is_public,
    'is_alias', false,
    'lifecycle', i.lifecycle
  )
    into v_identity
  from home.cookshare_public_routes r
  join home.cookshare_public_identities i
    on i.object_type = r.object_type
   and i.object_id = r.object_id
  where r.object_type = 'recipe'
    and r.object_id = p_recipe_id
    and r.route_kind = 'current'
    and r.is_current
    and i.lifecycle = 'active'
    and not coalesce(i.admin_disabled,false)
  order by r.created_at desc
  limit 1;

  if v_identity is null then
    return null;
  end if;

  return jsonb_build_object(
    'object_type', 'recipe',
    'title', case
      when v_lang='en' then coalesce(nullif(v_recipe.title_en,''),v_recipe.title)
      else coalesce(nullif(v_recipe.title,''),v_recipe.title_en)
    end,
    'description', case
      when v_lang='en' then coalesce(nullif(v_recipe.description_en,''),v_recipe.description)
      else coalesce(nullif(v_recipe.description,''),v_recipe.description_en)
    end,
    'cover_photo_url', coalesce(v_recipe.cover_photo_url, v_recipe.user_image_urls[1]),
    'user_image_urls', coalesce(v_recipe.user_image_urls, '{}'::text[]),
    'time', v_time,
    'servings', greatest(coalesce(v_recipe.servings,1),1),
    'nutrition', v_nutrition,
    'ingredients', v_ingredients,
    'steps', v_steps,
    'identity', v_identity
  );
end;
$function$;
