create extension if not exists pgcrypto with schema extensions;

create table if not exists users.account_deletion_otp_requests (
  id uuid primary key default gen_random_uuid(),
  email_hash text not null,
  ip_hash text,
  user_agent text,
  accepted boolean not null default true,
  requested_at timestamptz not null default now()
);

alter table users.account_deletion_otp_requests enable row level security;

revoke all on table users.account_deletion_otp_requests from anon;
revoke all on table users.account_deletion_otp_requests from authenticated;
grant select, insert on table users.account_deletion_otp_requests to service_role;

create index if not exists account_deletion_otp_requests_email_requested_idx
  on users.account_deletion_otp_requests (email_hash, requested_at desc);

create index if not exists account_deletion_otp_requests_ip_requested_idx
  on users.account_deletion_otp_requests (ip_hash, requested_at desc);

create or replace function users.delete_account_app_data(target_user_id uuid)
returns jsonb
language plpgsql
set search_path = ''
as $$
begin
  if target_user_id is null then
    raise exception 'target_user_id is required';
  end if;

  -- Auth-linked app data that must be removed before auth.admin.deleteUser().
  delete from ai.solve_session_turns where user_id = target_user_id;
  delete from ai.solve_sessions where user_id = target_user_id;
  delete from ai.memory_profiles where user_id = target_user_id;
  delete from cooklist.lists where user_id = target_user_id;
  delete from pantry.user_inventory where user_id = target_user_id;

  -- User-owned home, menu, and CookMode state.
  delete from users.cooking_victory_events where user_id = target_user_id;
  delete from home.cookmode_sessions where user_id = target_user_id;
  delete from home.saved_decks where user_id = target_user_id;
  delete from home.user_daily_slot_snapshots where user_id = target_user_id;
  delete from home.mesa_recipe_cooldowns where user_id = target_user_id;

  -- Explicit NO ACTION blocker: household.households.owner_id.
  delete from household.households where owner_id = target_user_id;

  -- Recipe import drafts may point at saved recipes and are user-owned.
  delete from menu.recipe_import_drafts where user_id = target_user_id;

  -- Explicit NO ACTION blocker: menu.recipes.author_id plus self-reference blockers.
  update menu.recipes
  set source_recipe_id = null
  where source_recipe_id in (
    select id from menu.recipes where author_id = target_user_id
  );

  update menu.recipe_sections
  set source_section_id = null
  where source_section_id in (
    select section.id
    from menu.recipe_sections as section
    join menu.recipes as recipe on recipe.id = section.recipe_id
    where recipe.author_id = target_user_id
  );

  update menu.recipe_steps
  set source_step_id = null
  where source_step_id in (
    select step.id
    from menu.recipe_steps as step
    join menu.recipes as recipe on recipe.id = step.recipe_id
    where recipe.author_id = target_user_id
  );

  delete from menu.recipes where author_id = target_user_id;

  -- Existing cascade FKs remove ACAS, billing, social, preferences, and profile children.
  delete from users.profiles where id = target_user_id;

  return jsonb_build_object('ok', true, 'user_id', target_user_id);
end;
$$;

revoke all on function users.delete_account_app_data(uuid) from users;
revoke all on function users.delete_account_app_data(uuid) from anon;
revoke all on function users.delete_account_app_data(uuid) from authenticated;
grant execute on function users.delete_account_app_data(uuid) to service_role;
