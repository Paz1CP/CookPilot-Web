-- Keep the canonical Gallery RPC's sort/materialized CTEs in memory.
-- The project default is 2184kB, which spills this query to temporary disk.
alter function home.rpc_cookshare_gallery_candidates(
  text, text, text, text, text[], text[], text[], text[], text[],
  integer, integer, text, integer, jsonb, jsonb
) set work_mem = '8MB';
