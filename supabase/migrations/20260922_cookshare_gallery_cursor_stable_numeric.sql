-- Use one stable decimal ordering key both in the sort and serialized cursor.
-- Nine decimal places retain distinct pg_trgm real values without relying on
-- floating-point JSON round trips through PostgREST and the web client.
do $migration$
declare
  v_function regprocedure := 'home.rpc_cookshare_gallery_candidates(text,text,text,text,text[],text[],text[],text[],text[],integer,integer,text,integer,jsonb,jsonb)'::regprocedure;
  v_definition text;
begin
  v_definition := pg_get_functiondef(v_function);

  if position('round(a.best_similarity::double precision::numeric, 9)' in v_definition) > 0 then
    return;
  end if;

  if position('v_cursor_similarity double precision := null;' in v_definition) = 0
     or position('case when v_query_normalized is not null then a.best_similarity::double precision else 0::double precision end as sort_similarity' in v_definition) = 0 then
    raise exception 'Expected Gallery similarity cursor expressions not found in %', v_function;
  end if;

  execute replace(
    replace(v_definition,
      'v_cursor_similarity double precision := null;',
      'v_cursor_similarity numeric := null;'),
    'case when v_query_normalized is not null then a.best_similarity::double precision else 0::double precision end as sort_similarity',
    'case when v_query_normalized is not null then round(a.best_similarity::double precision::numeric, 9) else 0::numeric end as sort_similarity'
  );
end
$migration$;
