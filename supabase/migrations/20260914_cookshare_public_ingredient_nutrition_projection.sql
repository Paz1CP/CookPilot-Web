create or replace function home.fn_cookshare_public_object_projection(
  p_object_type text,
  p_object_id uuid,
  p_language_code text default 'es'
)
returns jsonb
language plpgsql
stable
security definer
set search_path to 'home', 'public', 'menu', 'cookplan', 'cooklist', 'nutrition'
as $function$
declare
  v_title text;
  v_snapshot jsonb;
  v_projection jsonb;
begin
  if p_object_type = 'recipe' then
    return home.fn_cookshare_public_recipe_projection(p_object_id, p_language_code);
  elsif p_object_type in ('ingredient', 'category') then
    if p_object_type = 'ingredient' then
      select jsonb_build_object(
        'object_type', 'ingredient',
        'name', i.name,
        'name_en', i.name_en,
        'image_url', i.image_url,
        'nutrition', jsonb_build_object(
          'base', jsonb_build_object(
            'calories', i.calories,
            'protein_g', i.protein_g,
            'carbs_total_g', i.carbs_total_g,
            'carbs_available_g', i.carbs_available_g,
            'fat_total_g', i.fat_total_g,
            'fiber_g', i.fiber_g,
            'water_g', i.water_g
          ),
          'macro_breakdown', coalesce((
            select jsonb_build_object(
              'protein_high_bio_g', mb.protein_high_bio_g,
              'protein_low_bio_g', mb.protein_low_bio_g,
              'carbs_fast_digesting_g', mb.carbs_fast_digesting_g,
              'carbs_slow_digesting_g', mb.carbs_slow_digesting_g,
              'fiber_g', mb.fiber_g,
              'total_sugars', mb.total_sugars,
              'added_sugars_g', mb.added_sugars_g,
              'fat_saturated_g', mb.fat_saturated_g,
              'fat_monounsaturated_g', mb.fat_monounsaturated_g,
              'fat_polyunsaturated_g', mb.fat_polyunsaturated_g,
              'fat_trans_g', mb.fat_trans_g,
              'omega_3_g', mb.omega_3_g,
              'omega_6_g', mb.omega_6_g,
              'cholesterol_mg', mb.cholesterol_mg,
              'alcohol_g', mb.alcohol_g
            )
            from nutrition.ingredient_macro_breakdown mb
            where mb.ingredient_id = i.id
          ), '{}'::jsonb),
          'micronutrients', coalesce((
            select jsonb_build_object(
              'calcium_mg', mn.calcium_mg,
              'phosphorus_mg', mn.phosphorus_mg,
              'zinc_mg', mn.zinc_mg,
              'iron_mg', mn.iron_mg,
              'sodium_mg', mn.sodium_mg,
              'potassium_mg', mn.potassium_mg,
              'vitamin_a_rae_mg', mn.vitamin_a_rae_mg,
              'thiamin_mg', mn.thiamin_mg,
              'riboflavin_mg', mn.riboflavin_mg,
              'niacin_mg', mn.niacin_mg,
              'vitamin_c_mg', mn.vitamin_c_mg,
              'folic_acid_mg', mn.folic_acid_mg,
              'magnesium_mg', mn.magnesium_mg,
              'selenium_mg', mn.selenium_mg,
              'copper_mg', mn.copper_mg,
              'manganese_mg', mn.manganese_mg,
              'vitamin_b6_mg', mn.vitamin_b6_mg,
              'vitamin_b12_mg', mn.vitamin_b12_mg,
              'vitamin_d_mg', mn.vitamin_d_mg,
              'vitamin_e_mg', mn.vitamin_e_mg,
              'vitamin_k_mg', mn.vitamin_k_mg
            )
            from nutrition.ingredient_micronutrients mn
            where mn.ingredient_id = i.id
          ), '{}'::jsonb)
        ),
        'recipes', coalesce((select jsonb_agg(projected.value order by projected.title)
          from (
            select r.title, home.fn_cookshare_public_recipe_projection(r.id, p_language_code) as value
            from (
              select distinct rec.id, rec.title
              from menu.recipes rec
              join menu.recipe_composition_ingredients rci on rci.recipe_id = rec.id
              where rci.ingredient_id = i.id
                and home.fn_cookshare_effective_public('recipe', rec.id, null)
              order by rec.title, rec.id
              limit 48
            ) r
          ) projected
          where projected.value is not null), '[]'::jsonb)
      ) into v_projection
      from nutrition.ingredients i where i.id = p_object_id;
    else
      select jsonb_build_object(
        'object_type', 'category',
        'name', c.name,
        'name_en', c.name_en,
        'cover_photo_url', c.cover_photo_url,
        'recipes', coalesce((select jsonb_agg(projected.value order by projected.title)
          from (
            select r.title, home.fn_cookshare_public_recipe_projection(r.id, p_language_code) as value
            from (
              select distinct rec.id, rec.title
              from menu.recipes rec
              join menu.recipe_category_assignments a on a.recipe_id = rec.id
              where c.id = any(a.category_ids)
                and home.fn_cookshare_effective_public('recipe', rec.id, null)
              order by rec.title, rec.id
              limit 48
            ) r
          ) projected
          where projected.value is not null), '[]'::jsonb)
      ) into v_projection
      from menu.recipe_categories c where c.id = p_object_id;
    end if;
    return v_projection;
  elsif p_object_type in ('menu', 'day', 'week') then
    select s.title, s.content_snapshot into v_title, v_snapshot
    from cookplan.saved_items s
    where s.id = p_object_id and s.item_type::text = p_object_type and s.deleted_at is null;
  elsif p_object_type = 'list' then
    select coalesce(l.title, 'CookList'), jsonb_build_object('recipes', coalesce(l.recipes, '[]'::jsonb)) into v_title, v_snapshot
    from cooklist.lists l where l.id = p_object_id;
  end if;
  if v_title is null then return null; end if;
  return home.fn_cookshare_public_snapshot_projection(p_object_type, v_title, v_snapshot, p_language_code);
end;
$function$;
