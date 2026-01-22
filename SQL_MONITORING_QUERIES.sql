-- ============================================================================
-- DATABASE OPTIMIZATION MONITORING & TROUBLESHOOTING QUERIES
-- ============================================================================

-- ============================================================================
-- 1. CONNECTION POOL MONITORING
-- ============================================================================

-- View all active connections
SELECT
  datname,
  usename,
  application_name,
  state,
  query_start,
  state_change,
  query
FROM pg_stat_activity
WHERE datname = 'vivr'
ORDER BY state_change DESC;

-- Count connections per database
SELECT
  datname,
  count(*) as connections
FROM pg_stat_activity
GROUP BY datname
ORDER BY connections DESC;

-- Check for idle connections (potential pool leak)
SELECT
  datname,
  count(*) as idle_connections
FROM pg_stat_activity
WHERE state = 'idle'
  AND datname = 'vivr'
GROUP BY datname;

-- List long-running queries (potential bottlenecks)
SELECT
  pid,
  usename,
  application_name,
  state,
  query_start,
  now() - query_start as duration,
  query
FROM pg_stat_activity
WHERE datname = 'vivr'
  AND state != 'idle'
  AND (now() - query_start) > interval '10 seconds'
ORDER BY query_start;

-- ============================================================================
-- 2. INDEX PERFORMANCE ANALYSIS
-- ============================================================================

-- Find unused indexes (candidates for removal)
SELECT
  schemaname,
  tablename,
  indexname,
  idx_scan,
  idx_tup_read,
  idx_tup_fetch,
  pg_size_pretty(pg_relation_size(indexrelid)) as index_size
FROM pg_stat_user_indexes
WHERE idx_scan = 0
  AND indexrelname NOT LIKE 'pg_toast%'
ORDER BY pg_relation_size(indexrelid) DESC;

-- Find indexes with high maintenance cost (many writes, few reads)
SELECT
  schemaname,
  tablename,
  indexname,
  idx_scan,
  idx_tup_read,
  idx_tup_fetch,
  (SELECT sum(n_tup_ins + n_tup_upd + n_tup_del)
   FROM pg_stat_user_tables
   WHERE relname = tablename) as table_writes,
  pg_size_pretty(pg_relation_size(indexrelid)) as index_size
FROM pg_stat_user_indexes
ORDER BY pg_relation_size(indexrelid) DESC;

-- Check all indexes and their sizes
SELECT
  schemaname,
  tablename,
  indexname,
  pg_size_pretty(pg_relation_size(indexrelid)) as index_size,
  idx_scan,
  idx_tup_read,
  idx_tup_fetch
FROM pg_stat_user_indexes
ORDER BY pg_relation_size(indexrelid) DESC;

-- ============================================================================
-- 3. TABLE STATISTICS & BLOAT
-- ============================================================================

-- Estimate table bloat
SELECT
  schemaname,
  tablename,
  pg_size_pretty(pg_total_relation_size(schemaname||'.'||tablename)) as total_size,
  pg_size_pretty(pg_relation_size(schemaname||'.'||tablename)) as table_size,
  pg_size_pretty(pg_relation_size(schemaname||'.'||tablename, 'main')) as heap_size,
  round(100 * (pg_relation_size(schemaname||'.'||tablename, 'main')::float / pg_total_relation_size(schemaname||'.'||tablename))::numeric, 2) as heap_ratio,
  n_live_tup,
  n_dead_tup,
  round(100 * n_dead_tup::float / (n_live_tup + n_dead_tup), 2) as dead_ratio,
  last_vacuum,
  last_autovacuum
FROM pg_stat_user_tables
WHERE schemaname NOT IN ('pg_catalog', 'information_schema')
ORDER BY pg_total_relation_size(schemaname||'.'||tablename) DESC;

-- Find tables needing VACUUM
SELECT
  schemaname,
  tablename,
  n_dead_tup,
  round(100 * n_dead_tup::float / (n_live_tup + n_dead_tup), 2) as dead_ratio,
  last_autovacuum,
  last_vacuum
FROM pg_stat_user_tables
WHERE (n_dead_tup > 1000 OR (n_dead_tup > 0 AND n_live_tup = 0))
  AND schemaname NOT IN ('pg_catalog', 'information_schema')
ORDER BY n_dead_tup DESC;

-- ============================================================================
-- 4. QUERY PERFORMANCE ANALYSIS
-- ============================================================================

-- Top 20 slowest queries (requires pg_stat_statements extension)
-- First, enable it:
-- ALTER SYSTEM SET shared_preload_libraries = 'pg_stat_statements';
-- SELECT pg_reload_conf();

SELECT
  query,
  calls,
  total_time,
  mean_time,
  max_time,
  rows,
  100.0 * shared_blks_hit / (shared_blks_hit + shared_blks_read) as cache_hit_ratio
FROM pg_stat_statements
ORDER BY mean_time DESC
LIMIT 20;

-- Most frequently called queries
SELECT
  query,
  calls,
  total_time,
  mean_time,
  rows
FROM pg_stat_statements
ORDER BY calls DESC
LIMIT 20;

-- Queries with worst cache performance
SELECT
  query,
  calls,
  shared_blks_read,
  shared_blks_hit,
  round(100.0 * shared_blks_hit / (shared_blks_hit + shared_blks_read), 2) as cache_hit_ratio
FROM pg_stat_statements
WHERE (shared_blks_hit + shared_blks_read) > 0
ORDER BY cache_hit_ratio ASC
LIMIT 20;

-- ============================================================================
-- 5. SPECIFIC TABLE QUERY ANALYSIS (VIVR TABLES)
-- ============================================================================

-- Product table statistics
SELECT
  'Product' as table_name,
  count(*) as row_count,
  pg_size_pretty(pg_total_relation_size('Product')) as total_size,
  (SELECT count(*) FROM pg_indexes WHERE tablename = 'Product') as index_count,
  n_live_tup,
  n_dead_tup,
  last_vacuum,
  last_autovacuum
FROM "Product";

-- Review statistics
SELECT
  'Review' as table_name,
  count(*) as row_count,
  pg_size_pretty(pg_total_relation_size('Review')) as total_size,
  (SELECT count(*) FROM pg_indexes WHERE tablename = 'Review') as index_count,
  n_live_tup,
  n_dead_tup,
  last_vacuum,
  last_autovacuum
FROM "Review"
CROSS JOIN pg_stat_user_tables
WHERE relname = 'Review';

-- Order statistics
SELECT
  'Order' as table_name,
  count(*) as row_count,
  pg_size_pretty(pg_total_relation_size('Order')) as total_size,
  (SELECT count(*) FROM pg_indexes WHERE tablename = 'Order') as index_count,
  n_live_tup,
  n_dead_tup,
  last_vacuum,
  last_autovacuum
FROM "Order"
CROSS JOIN pg_stat_user_tables
WHERE relname = 'Order';

-- ============================================================================
-- 6. QUERY PLAN ANALYSIS (Examples)
-- ============================================================================

-- Example: Product listing query plan (BEFORE optimization)
-- EXPLAIN ANALYZE
-- SELECT
--   p.id, p.name, p.slug, p.price,
--   c.id, c.name, c.slug,
--   COUNT(r.id) as review_count,
--   AVG(r.rating) as avg_rating
-- FROM "Product" p
-- LEFT JOIN "Category" c ON p."categoryId" = c.id
-- LEFT JOIN "Review" r ON p.id = r."productId"
-- WHERE p."categoryId" = 'category-id'
-- GROUP BY p.id, c.id
-- LIMIT 12;

-- Example: Product listing query plan (AFTER optimization with index)
-- EXPLAIN ANALYZE
-- SELECT
--   p.id, p.name, p.slug, p.price,
--   c.id, c.name, c.slug
-- FROM "Product" p
-- LEFT JOIN "Category" c ON p."categoryId" = c.id
-- WHERE p."categoryId" = 'category-id'
-- LIMIT 12;
-- -- Then use aggregation separately

-- ============================================================================
-- 7. MAINTENANCE OPERATIONS
-- ============================================================================

-- Full vacuum on specific table (use during maintenance window)
-- VACUUM FULL "Product";

-- Vacuum with analysis
-- VACUUM ANALYZE "Product";

-- Reindex table (rebuilds all indexes)
-- REINDEX TABLE "Product";

-- Reindex specific index (non-blocking)
-- REINDEX INDEX CONCURRENTLY idx_product_categoryid_featured;

-- Update table statistics
-- ANALYZE "Product";

-- ============================================================================
-- 8. CACHE EFFECTIVENESS
-- ============================================================================

-- Overall cache hit ratio
SELECT
  sum(blks_read) as disk_reads,
  sum(blks_hit) as cache_hits,
  sum(blks_hit) + sum(blks_read) as total_blocks,
  round(100.0 * sum(blks_hit) / (sum(blks_hit) + sum(blks_read)), 2) as cache_ratio
FROM pg_stat_user_tables;

-- Cache effectiveness per table
SELECT
  schemaname,
  tablename,
  blks_read,
  blks_hit,
  blks_hit + blks_read as total_blocks,
  round(100.0 * blks_hit / (blks_hit + blks_read), 2) as cache_ratio
FROM pg_stat_user_tables
WHERE (blks_hit + blks_read) > 0
ORDER BY cache_ratio ASC;

-- ============================================================================
-- 9. WRITE PERFORMANCE
-- ============================================================================

-- Tables with most writes (insert/update/delete)
SELECT
  schemaname,
  tablename,
  n_tup_ins as inserts,
  n_tup_upd as updates,
  n_tup_del as deletes,
  (n_tup_ins + n_tup_upd + n_tup_del) as total_writes,
  n_live_tup as rows
FROM pg_stat_user_tables
WHERE schemaname NOT IN ('pg_catalog', 'information_schema')
ORDER BY total_writes DESC;

-- ============================================================================
-- 10. TRANSACTION & LOCK ANALYSIS
-- ============================================================================

-- Check for blocking locks
SELECT
  blocked_locks.pid AS blocked_pid,
  blocked_activity.query AS blocked_query,
  blocking_locks.pid AS blocking_pid,
  blocking_activity.query AS blocking_query,
  blocked_activity.application_name AS blocked_application,
  blocking_activity.application_name AS blocking_application
FROM pg_catalog.pg_locks blocked_locks
  JOIN pg_catalog.pg_stat_activity blocked_activity ON blocked_activity.pid = blocked_locks.pid
  JOIN pg_catalog.pg_locks blocking_locks
    ON blocking_locks.locktype = blocked_locks.locktype
    AND blocking_locks.database IS NOT DISTINCT FROM blocked_locks.database
    AND blocking_locks.relation IS NOT DISTINCT FROM blocked_locks.relation
    AND blocking_locks.page IS NOT DISTINCT FROM blocked_locks.page
    AND blocking_locks.tuple IS NOT DISTINCT FROM blocked_locks.tuple
    AND blocking_locks.virtualxid IS NOT DISTINCT FROM blocked_locks.virtualxid
    AND blocking_locks.transactionid IS NOT DISTINCT FROM blocked_locks.transactionid
    AND blocking_locks.classid IS NOT DISTINCT FROM blocked_locks.classid
    AND blocking_locks.objid IS NOT DISTINCT FROM blocked_locks.objid
    AND blocking_locks.objsubid IS NOT DISTINCT FROM blocked_locks.objsubid
    AND blocking_locks.pid != blocked_locks.pid
  JOIN pg_catalog.pg_stat_activity blocking_activity ON blocking_activity.pid = blocking_locks.pid
WHERE NOT blocked_locks.granted;

-- Check transaction durations
SELECT
  pid,
  usename,
  application_name,
  xact_start,
  now() - xact_start as duration,
  state,
  query
FROM pg_stat_activity
WHERE xact_start IS NOT NULL
  AND (now() - xact_start) > interval '1 minute'
ORDER BY xact_start;

-- ============================================================================
-- 11. PERFORMANCE REGRESSION DETECTION
-- ============================================================================

-- Compare index effectiveness over time
-- Run this query regularly and store results for trend analysis
SELECT
  now() as check_time,
  schemaname,
  indexname,
  idx_scan,
  idx_tup_read,
  idx_tup_fetch,
  pg_size_pretty(pg_relation_size(indexrelid)) as index_size
FROM pg_stat_user_indexes
WHERE schemaname NOT IN ('pg_catalog', 'information_schema')
ORDER BY indexname;

-- ============================================================================
-- QUICK DIAGNOSTICS
-- ============================================================================

-- Run this to get overall database health
WITH stats AS (
  SELECT
    datname,
    numbackends,
    xact_commit,
    xact_rollback,
    tup_returned,
    tup_fetched,
    tup_inserted,
    tup_updated,
    tup_deleted
  FROM pg_stat_database
  WHERE datname = 'vivr'
)
SELECT
  'Database Health Summary' as metric,
  to_json(stats) as value
FROM stats;

-- Monitor database size growth
SELECT
  datname,
  pg_size_pretty(pg_database_size(datname)) as size,
  numbackends,
  xact_commit,
  xact_rollback
FROM pg_stat_database
WHERE datname IN ('vivr', 'postgres')
ORDER BY pg_database_size(datname) DESC;

-- ============================================================================
-- RECOMMENDATIONS
-- ============================================================================

-- If cache_ratio < 90%:
--   1. Increase shared_buffers in postgresql.conf
--   2. Consider more RAM for server
--   3. Review query patterns for optimization

-- If index bloat > 50%:
--   1. Run VACUUM FULL during maintenance window
--   2. Or use REINDEX CONCURRENTLY for online reindexing

-- If long-running queries found:
--   1. Review EXPLAIN ANALYZE output
--   2. Check if needed indexes exist
--   3. Consider query rewrite or denormalization

-- If connection pool near max:
--   1. Increase default_pool_size in PgBouncer
--   2. Review for connection leaks
--   3. Optimize queries to reduce duration

-- If slow queries detected:
--   1. Review execution plans with EXPLAIN ANALYZE
--   2. Check index usage
--   3. Consider query rewrite
--   4. Add missing indexes if needed
