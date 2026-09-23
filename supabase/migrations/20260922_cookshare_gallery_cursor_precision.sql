-- Transitional cursor widening for databases still using the original real
-- similarity key. The subsequent stable-numeric migration completes the fix.
do $migration$
declare
  v_function regprocedure := 'home.rpc_cookshare_gallery_candidates(text,text,text,text,text[],text[],text[],text[],text[],integer,integer,text,integer,jsonb,jsonb)'::regprocedure;
  v_definition text;
begin
  v_definition := pg_get_functiondef(v_function);

  if position('v_cursor_similarity double precision := null;' in v_definition) > 0
     or position('round(a.best_similarity::double precision::numeric, 9)' in v_definition) > 0 then
    return;
  end if;

  if position('v_cursor_similarity numeric := null;' in v_definition) = 0
     or position('case when v_query_normalized is not null then a.best_similarity else 0 end as sort_similarity' in v_definition) = 0 then
    raise exception 'Expected Gallery cursor expressions not found in %', v_function;
  end if;

  execute replace(
    replace(v_definition,
      'v_cursor_similarity numeric := null;',
      'v_cursor_similarity double precision := null;'),
    'case when v_query_normalized is not null then a.best_similarity else 0 end as sort_similarity',
    'case when v_query_normalized is not null then a.best_similarity::double precision else 0::double precision end as sort_similarity'
  );
end
$migration$;
