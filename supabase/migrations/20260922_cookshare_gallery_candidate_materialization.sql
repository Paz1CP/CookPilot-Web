-- Reuse normalized Gallery candidate text across all search predicates.
do $migration$
declare
  v_function regprocedure := 'home.rpc_cookshare_gallery_candidates(text,text,text,text,text[],text[],text[],text[],text[],integer,integer,text,integer,jsonb,jsonb)'::regprocedure;
  v_definition text;
begin
  v_definition := pg_get_functiondef(v_function);

  if position('  candidates as materialized (' in v_definition) > 0 then
    return;
  end if;

  if position('  candidates as (' in v_definition) = 0 then
    raise exception 'Expected candidates CTE not found in %', v_function;
  end if;

  execute replace(v_definition, '  candidates as (', '  candidates as materialized (');
end
$migration$;
