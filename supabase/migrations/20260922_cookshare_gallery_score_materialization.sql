-- Materialize the computed text scores once inside the canonical Gallery RPC.
-- This avoids recalculating trigram similarity in its accepted-match predicate and ranking.
do $migration$
declare
  v_function regprocedure := 'home.rpc_cookshare_gallery_candidates(text,text,text,text,text[],text[],text[],text[],text[],integer,integer,text,integer,jsonb,jsonb)'::regprocedure;
  v_definition text;
begin
  v_definition := pg_get_functiondef(v_function);

  if position('  scored as materialized (' in v_definition) > 0 then
    return;
  end if;

  if position('  scored as (' in v_definition) = 0 then
    raise exception 'Expected scored CTE not found in %', v_function;
  end if;

  execute replace(v_definition, '  scored as (', '  scored as materialized (');
end
$migration$;
