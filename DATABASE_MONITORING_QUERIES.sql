-- ============================================================================
-- VIVR Database Monitoring & Performance Queries
-- ============================================================================
-- Use these queries to monitor database performance after optimization
-- Location: C:\Users\freex\Desktop\Projet VS Code\VIVR
-- ============================================================================

-- ============================================================================
-- 1. INDEX USAGE ANALYSIS
-- ============================================================================

-- Show all indexes and their usage statistics
SELECT
  schemaname,
  tablename,
  indexname,
  idx_scan as scans,
  idx_tup_read as tuples_read,
  idx_tup_fetch as tuples_fetched,
  pg_size_pretty(pg_relation_size(indexrelid)) as size
FROM pg_stat_user_indexes
ORDER BY idx_scan DESC;

-- Find unused indexes (optimization opportunity)
SELECT
  schemaname,
  tablename,
  indexname,
  idx_scan
FROM pg_stat_user_indexes
WHERE idx_scan = 0
AND indexname NOT LIKE 'pg_toast%'
ORDER BY pg_relation_size(indexrelid) DESC;

-- Find indexes that should be used but aren't
-- (Indicates missing or ineffective indexes)
SELECT
  schemaname,
  tablename,
  indexname,
  idx_scan as index_scans,
  seq_scan as table_seq_scans
FROM pg_stat_user_indexes i
JOIN pg_stat_user_tables t ON i.relname = t.tablename
WHERE i.idx_scan < t.seq_scan * 0.1
AND i.idx_scan < 1000
ORDER BY t.seq_scan DESC;

-- ============================================================================
-- 2. QUERY PERFORMANCE ANALYSIS
-- ============================================================================

-- Enable query statistics extension (run once)
-- CREATE EXTENSION IF NOT EXISTS pg_stat_statements;

-- Find slowest queries
SELECT
  query,
  calls,
  total_time / 1000 as total_seconds,
  mean_time,
  max_time,
  stddev_time
FROM pg_stat_statements
WHERE query NOT LIKE 'SELECT 1'
AND query NOT LIKE '%pg_stat%'
ORDER BY mean_time DESC
LIMIT 20;

-- Find most frequently called queries
SELECT
  query,
  calls,
  mean_time,
  total_time / 1000 as total_seconds
FROM pg_stat_statements
WHERE query NOT LIKE 'SELECT 1'
AND query NOT LIKE '%pg_stat%'
ORDER BY calls DESC
LIMIT 20;

-- Find queries with high variance (inconsistent performance)
SELECT
  query,
  calls,
  mean_time,
  stddev_time,
  max_time,
  (stddev_time / mean_time) as variance_ratio
FROM pg_stat_statements
WHERE mean_time > 100
AND stddev_time > 0
ORDER BY variance_ratio DESC
LIMIT 15;

-- ============================================================================
-- 3. CONNECTION POOLING ANALYSIS
-- ============================================================================

-- Current active connections
SELECT
  datname as database,
  usename as user,
  application_name,
  state,
  count(*) as count,
  max(EXTRACT(EPOCH FROM (now() - state_change))) as oldest_idle_seconds
FROM pg_stat_activity
WHERE datname = 'vivr'
GROUP BY datname, usename, application_name, state
ORDER BY count DESC;

-- Connection count by state
SELECT
  state,
  count(*) as connection_count
FROM pg_stat_activity
WHERE datname = 'vivr'
GROUP BY state;

-- Long-running queries (potential issues)
SELECT
  pid,
  usename,
  application_name,
  state,
  query,
  EXTRACT(EPOCH FROM (now() - query_start)) as seconds_running
FROM pg_stat_activity
WHERE datname = 'vivr'
AND state != 'idle'
AND query_start < now() - INTERVAL '5 minutes'
ORDER BY query_start;

-- ============================================================================
-- 4. TABLE ANALYSIS
-- ============================================================================

-- Table sizes and row counts
SELECT
  schemaname,
  tablename,
  pg_size_pretty(pg_total_relation_size(schemaname||'.'||tablename)) as total_size,
  pg_size_pretty(pg_relation_size(schemaname||'.'||tablename)) as table_size,
  pg_size_pretty(pg_total_relation_size(schemaname||'.'||tablename) - pg_relation_size(schemaname||'.'||tablename)) as indexes_size,
  n_live_tup as live_rows,
  n_dead_tup as dead_rows,
  ROUND(100 * n_dead_tup / NULLIF(n_live_tup + n_dead_tup, 0), 2) as dead_ratio
FROM pg_stat_user_tables
ORDER BY pg_total_relation_size(schemaname||'.'||tablename) DESC;

-- Tables with high dead row ratio (need VACUUM)
SELECT
  schemaname,
  tablename,
  n_live_tup,
  n_dead_tup,
  ROUND(100 * n_dead_tup / NULLIF(n_live_tup + n_dead_tup, 0), 2) as dead_ratio,
  last_vacuum,
  last_autovacuum
FROM pg_stat_user_tables
WHERE n_dead_tup > 1000
ORDER BY dead_ratio DESC;

-- Sequence scan vs index scan analysis
SELECT
  schemaname,
  tablename,
  seq_scan,
  seq_tup_read,
  idx_scan,
  idx_tup_fetch,
  CASE
    WHEN seq_scan > idx_scan THEN 'MOSTLY SEQUENTIAL'
    WHEN seq_scan = 0 THEN 'INDEX ONLY'
    ELSE 'MOSTLY INDEXED'
  END as scan_type
FROM pg_stat_user_tables
WHERE schemaname NOT LIKE 'pg_%'
ORDER BY seq_scan DESC;

-- ============================================================================
-- 5. INDEX SIZE ANALYSIS
-- ============================================================================

-- Largest indexes
SELECT
  schemaname,
  tablename,
  indexname,
  pg_size_pretty(pg_relation_size(indexrelid)) as size,
  idx_scan as scans,
  idx_tup_read as tuples_read
FROM pg_stat_user_indexes
ORDER BY pg_relation_size(indexrelid) DESC
LIMIT 20;

-- Index bloat estimation
SELECT
  schemaname,
  tablename,
  indexname,
  pg_size_pretty(pg_relation_size(indexrelid)) as index_size,
  ROUND(100.0 * (pg_relation_size(indexrelid) - pg_relation_size(indexrelid, 'main')) / pg_relation_size(indexrelid)) as bloat_percent
FROM pg_stat_user_indexes
ORDER BY pg_relation_size(indexrelid) - pg_relation_size(indexrelid, 'main') DESC
LIMIT 20;

-- ============================================================================
-- 6. CACHE HIT RATIO
-- ============================================================================

-- Overall cache hit ratio
SELECT
  SUM(heap_blks_hit) / (SUM(heap_blks_hit) + SUM(heap_blks_read)) as cache_hit_ratio,
  SUM(heap_blks_read) as disk_reads,
  SUM(heap_blks_hit) as cache_hits
FROM pg_statio_user_tables;

-- Cache hit ratio by table
SELECT
  schemaname,
  tablename,
  heap_blks_read,
  heap_blks_hit,
  ROUND(
    100.0 * heap_blks_hit / NULLIF(heap_blks_hit + heap_blks_read, 0),
    2
  ) as cache_hit_ratio
FROM pg_statio_user_tables
WHERE heap_blks_hit + heap_blks_read > 0
ORDER BY cache_hit_ratio ASC
LIMIT 20;

-- ============================================================================
-- 7. PRODUCT MODEL ANALYSIS
-- ============================================================================

-- Product indexes usage
SELECT
  indexname,
  idx_scan as scans,
  idx_tup_read,
  idx_tup_fetch
FROM pg_stat_user_indexes
WHERE tablename = 'Product'
ORDER BY idx_scan DESC;

-- Product query performance
SELECT
  query,
  calls,
  mean_time,
  max_time
FROM pg_stat_statements
WHERE query LIKE '%"Product"%'
AND query NOT LIKE '%pg_stat%'
ORDER BY mean_time DESC;

-- ============================================================================
-- 8. ORDER MODEL ANALYSIS
-- ============================================================================

-- Order indexes usage
SELECT
  indexname,
  idx_scan as scans,
  idx_tup_read,
  idx_tup_fetch
FROM pg_stat_user_indexes
WHERE tablename = 'Order'
ORDER BY idx_scan DESC;

-- Orders by user query performance
SELECT
  query,
  calls,
  mean_time,
  max_time
FROM pg_stat_statements
WHERE query LIKE '%userId%'
OR query LIKE '%"Order"%'
ORDER BY mean_time DESC
LIMIT 10;

-- ============================================================================
-- 9. REVIEW MODEL ANALYSIS
-- ============================================================================

-- Review indexes usage
SELECT
  indexname,
  idx_scan as scans,
  idx_tup_read,
  idx_tup_fetch
FROM pg_stat_user_indexes
WHERE tablename = 'Review'
ORDER BY idx_scan DESC;

-- Reviews per product (for pagination analysis)
SELECT
  productId,
  COUNT(*) as review_count,
  AVG(rating) as avg_rating
FROM Review
GROUP BY productId
HAVING COUNT(*) > 100
ORDER BY review_count DESC;

-- ============================================================================
-- 10. QUERY EXECUTION PLANS
-- ============================================================================

-- Product listing query plan
EXPLAIN ANALYZE
SELECT
  p.id, p.name, p.slug, p.price, p.featured,
  c.id, c.name,
  COUNT(DISTINCT r.id) as review_count
FROM "Product" p
LEFT JOIN "Category" c ON p."categoryId" = c.id
LEFT JOIN "Review" r ON p.id = r."productId"
WHERE p."categoryId" = '...' AND p.featured = true
GROUP BY p.id, c.id
ORDER BY p."createdAt" DESC
LIMIT 12;

-- Product detail query plan
EXPLAIN ANALYZE
SELECT *
FROM "Product"
WHERE slug = 'product-slug'
LIMIT 1;

-- User orders query plan
EXPLAIN ANALYZE
SELECT o.*,
  json_agg(
    json_build_object(
      'id', oi.id,
      'name', oi.name,
      'price', oi.price,
      'quantity', oi.quantity
    )
  ) as items
FROM "Order" o
LEFT JOIN "OrderItem" oi ON o.id = oi."orderId"
WHERE o."userId" = '...'
GROUP BY o.id
ORDER BY o."createdAt" DESC;

-- ============================================================================
-- 11. MAINTENANCE RECOMMENDATIONS
-- ============================================================================

-- Tables that need VACUUM
SELECT
  schemaname,
  tablename,
  last_vacuum,
  last_autovacuum,
  vacuum_count,
  autovacuum_count,
  n_dead_tup
FROM pg_stat_user_tables
WHERE last_vacuum IS NULL
OR last_vacuum < now() - INTERVAL '7 days'
ORDER BY last_vacuum DESC NULLS FIRST;

-- Indexes that need REINDEX
SELECT
  schemaname,
  tablename,
  indexname,
  pg_size_pretty(pg_relation_size(indexrelid)) as size,
  idx_blks_read,
  idx_blks_hit
FROM pg_stat_user_indexes
WHERE idx_blks_read > 10000
AND idx_blks_hit < idx_blks_read * 0.5
ORDER BY idx_blks_read DESC;

-- ============================================================================
-- 12. PERFORMANCE MONITORING DASHBOARD QUERIES
-- ============================================================================

-- Real-time database stats (run periodically)
SELECT
  'connections' as metric,
  COUNT(*)::text as value
FROM pg_stat_activity
WHERE datname = 'vivr'
UNION ALL
SELECT 'cache_hit_ratio',
  ROUND(
    100.0 * SUM(heap_blks_hit) / NULLIF(SUM(heap_blks_hit) + SUM(heap_blks_read), 0),
    2
  )::text
FROM pg_statio_user_tables
UNION ALL
SELECT 'slow_queries',
  COUNT(*)::text
FROM pg_stat_statements
WHERE mean_time > 1000
UNION ALL
SELECT 'dead_rows',
  SUM(n_dead_tup)::text
FROM pg_stat_user_tables
UNION ALL
SELECT 'total_indexes',
  COUNT(*)::text
FROM pg_stat_user_indexes;

-- ============================================================================
-- 13. OPTIMIZATION VERIFICATION QUERIES
-- ============================================================================

-- Verify composite indexes exist
SELECT
  indexname,
  column_names
FROM (
  SELECT
    i.indexname,
    a.attname as column_names,
    row_number() OVER (PARTITION BY i.indexname ORDER BY a.attnum) as col_num
  FROM pg_stat_user_indexes i
  JOIN pg_index ix ON i.indexrelid = ix.indexrelid
  JOIN pg_attribute a ON a.attrelid = ix.indrelid AND a.attnum = ANY(ix.indkey)
) sub
WHERE indexname LIKE '%categoryId%'
OR indexname LIKE '%userId%'
OR indexname LIKE '%createdAt%'
ORDER BY indexname, col_num;

-- Verify Decimal precision
SELECT
  tablename,
  attname,
  typname,
  atttypmod
FROM pg_attribute
JOIN pg_class ON pg_class.oid = pg_attribute.attrelid
JOIN pg_namespace ON pg_namespace.oid = pg_class.relnamespace
JOIN pg_type ON pg_type.oid = pg_attribute.atttypid
WHERE tablename IN ('Product', 'Order', 'OrderItem')
AND typname = 'numeric'
ORDER BY tablename, attname;

-- ============================================================================
-- USAGE INSTRUCTIONS
-- ============================================================================
--
-- 1. Connect to database:
--    psql -h localhost -U username -d vivr
--
-- 2. Copy and run queries from this file
--
-- 3. Key metrics to track:
--    - Index scans (should be HIGH for optimized indexes)
--    - Query execution time (should be LOW)
--    - Cache hit ratio (should be HIGH, > 90%)
--    - Dead rows ratio (should be LOW, < 5%)
--    - Connections (should be <= max_connections)
--
-- 4. For performance issues:
--    - Check slow queries section
--    - Run EXPLAIN ANALYZE on slow queries
--    - Check cache hit ratio
--    - Verify indexes are being used
--
-- ============================================================================

