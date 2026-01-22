# Database Optimization Implementation Checklist

## Phase 1: Immediate Improvements (Week 1) - CRITICAL

### Priority: CRITICAL - Apply these immediately

- [ ] **Schema Index Optimization**
  - [ ] Review `SCHEMA_OPTIMIZATIONS.prisma` file
  - [ ] Update `prisma/schema.prisma` with recommended changes:
    - [ ] Change Decimal(10,2) to Decimal(12,2) for all money fields
    - [ ] Add new indexes for Product (categoryId+featured, createdAt, stock)
    - [ ] Add new indexes for Review (productId+verified, userId+createdAt)
    - [ ] Add new indexes for Order (userId+createdAt, status+createdAt, paymentId, paymentMethod)
    - [ ] Add new indexes for Wishlist (userId+createdAt)
    - [ ] Remove redundant index on Product.featured
    - [ ] Remove inefficient index on Review.rating
    - [ ] Remove redundant @index on @unique fields
  - [ ] Create migration: `npx prisma migrate dev --name add_performance_indexes`
  - [ ] Review generated SQL in `prisma/migrations/[timestamp]_add_performance_indexes/migration.sql`
  - [ ] Apply to database: `npx prisma migrate deploy`
  - **Estimated time**: 1-2 hours

- [ ] **Fix N+1 Query Problems**
  - [ ] **File**: `app/api/products/route.ts` (GET method)
    - [ ] Replace full review fetching with aggregation
    - [ ] Use `_count` for review count
    - [ ] Use `groupBy` for average rating calculation
    - [ ] Test with multiple products and verify only 2 queries executed
    - **Estimated time**: 45 minutes
    - **Expected improvement**: 60-70% faster

  - [ ] **File**: `app/api/products/[slug]/route.ts` (GET method)
    - [ ] Paginate reviews (limit to 10 instead of all)
    - [ ] Use aggregation for review statistics
    - [ ] Batch queries with Promise.all()
    - [ ] Verify only 4 queries total (product, reviews, stats, related)
    - **Estimated time**: 45 minutes
    - **Expected improvement**: 70-80% faster

  - [ ] **File**: `app/api/orders/route.ts` (GET method)
    - [ ] Replace `include: { product: true }` with `select` to fetch only needed fields
    - [ ] Remove unnecessary product data from response
    - **Estimated time**: 30 minutes
    - **Expected improvement**: 50% less bandwidth

- [ ] **Add Transactions to Order Creation**
  - [ ] **File**: `app/api/orders/route.ts` (POST method)
    - [ ] Wrap order creation in `prisma.$transaction()`
    - [ ] Add stock validation before order creation
    - [ ] Update stock in same transaction
    - [ ] Add error handling for stock errors
    - [ ] Test failure scenarios
    - **Estimated time**: 1 hour
    - **Expected benefit**: Prevent data inconsistencies

### Testing Phase 1

```bash
# Test each endpoint for N+1 queries
# Enable query logging in development
DATABASE_QUERY_LOGGING=true npm run dev

# Monitor logs for:
# - Product listing should show 2-3 queries only
# - Product detail should show 4 queries max
# - Order listing should use select optimization

# Run performance tests
npm run test:performance
```

---

## Phase 2: Important Improvements (Week 2-3) - HIGH PRIORITY

### Priority: HIGH - Apply these for production stability

- [ ] **Connection Pooling Configuration**
  - [ ] Install and configure PgBouncer OR use RDS Proxy
    - [ ] If self-hosted: `apt-get install pgbouncer`
    - [ ] Create `/etc/pgbouncer/pgbouncer.ini`:
      ```ini
      [databases]
      vivr = host=localhost port=5432 dbname=vivr

      [pgbouncer]
      pool_mode = transaction
      max_client_conn = 1000
      default_pool_size = 30
      reserve_pool_size = 5
      ```
    - [ ] Start PgBouncer: `sudo systemctl start pgbouncer`
  - [ ] Update `.env.production.local`:
    ```
    DATABASE_URL_POOLING="postgresql://user:pass@pgbouncer:6432/vivr?schema=public"
    ```
  - [ ] Update `lib/prisma.ts` to use pooling URL
  - [ ] Test with load:
    ```bash
    npm install -g artillery
    artillery load test.yaml
    ```
  - **Estimated time**: 2-3 hours
  - **Expected benefit**: Handle 10x more concurrent connections

- [ ] **Add Money Utilities**
  - [ ] Copy `lib/money.ts` to project
  - [ ] Update all API endpoints to use `toNumber()` helper
  - [ ] Update order creation to use `parseMoney()` for input validation
  - [ ] Add `lib/address.ts` TypeScript interfaces
  - **Estimated time**: 1-2 hours
  - **Expected benefit**: Type safety, prevent rounding errors

- [ ] **Redis Caching Layer**
  - [ ] Install Redis:
    ```bash
    # macOS
    brew install redis

    # Or use Docker
    docker run -d -p 6379:6379 redis:latest

    # Or production: Upstash, Redis Cloud, AWS ElastiCache
    ```
  - [ ] Install Prisma client:
    ```bash
    npm install @upstash/redis
    ```
  - [ ] Create `lib/cache.ts` (or copy from audit)
  - [ ] Update `.env`:
    ```
    REDIS_URL="redis://localhost:6379"
    REDIS_TOKEN="optional-password"
    ```
  - [ ] Add caching to:
    - [ ] `app/api/products/route.ts` - Cache product listings
    - [ ] `app/api/products/[slug]/route.ts` - Cache product details
    - [ ] `app/api/categories/route.ts` - Cache category list
  - [ ] Implement cache invalidation:
    - [ ] On product create/update: invalidate product caches
    - [ ] On review create: invalidate product detail + stats caches
    - [ ] On order create: invalidate user order cache
  - **Estimated time**: 3-4 hours
  - **Expected benefit**: 10-100x faster for cached responses

### Testing Phase 2

```bash
# Verify connection pooling works
psql -h localhost -p 6432 -U user -d vivr -c "SELECT count(*) FROM pg_stat_activity;"

# Load test with caching
npm run test:load

# Monitor cache hit rates
redis-cli INFO stats
```

---

## Phase 3: Nice-to-Have Improvements (Week 3-4) - MEDIUM PRIORITY

### Priority: MEDIUM - Apply these for advanced optimization

- [ ] **Review Pagination & Infinite Loading**
  - [ ] Implement pagination for product reviews
  - [ ] Add "Load more reviews" functionality
  - [ ] Prevent loading thousands of reviews at once
  - [ ] **Estimated time**: 2 hours
  - **Expected benefit**: Reduce payload size

- [ ] **Materialized Views (Advanced)**
  - [ ] Create materialized view for product statistics
    ```sql
    CREATE MATERIALIZED VIEW product_stats AS
    SELECT
      p.id,
      COUNT(r.id) as review_count,
      COALESCE(AVG(r.rating), 0) as avg_rating
    FROM "Product" p
    LEFT JOIN "Review" r ON p.id = r."productId"
    GROUP BY p.id;

    CREATE INDEX idx_product_stats_id ON product_stats(id);
    ```
  - [ ] Refresh view on schedule: `REFRESH MATERIALIZED VIEW product_stats;`
  - [ ] Update queries to use materialized view
  - [ ] **Estimated time**: 2-3 hours
  - **Expected benefit**: Aggregation queries 10x faster

- [ ] **Query Monitoring Dashboard**
  - [ ] Enable slow query logging:
    ```sql
    ALTER SYSTEM SET log_min_duration_statement = 1000;
    SELECT pg_reload_conf();
    ```
  - [ ] Set up monitoring with DataDog or New Relic
  - [ ] Create dashboard for:
    - [ ] Query count and duration
    - [ ] Connection pool usage
    - [ ] Cache hit rates
    - [ ] Database CPU and memory
  - [ ] Set up alerts for:
    - [ ] Queries > 5 seconds
    - [ ] Connection pool near capacity
    - [ ] Cache hit rate < 50%
  - [ ] **Estimated time**: 2-3 hours
  - **Expected benefit**: Early detection of performance issues

- [ ] **Batch Processing for Orders**
  - [ ] Implement order processing queue (Bull, RabbitMQ)
  - [ ] Move heavy operations to background jobs
  - [ ] Add job retry logic
  - [ ] **Estimated time**: 3-4 hours
  - **Expected benefit**: Prevent request timeouts

### Testing Phase 3

```bash
# Check materialized view performance
EXPLAIN ANALYZE
SELECT * FROM product_stats
WHERE id IN (SELECT id FROM product_stats LIMIT 10);

# Monitor slow queries
tail -f /var/log/postgresql/postgresql.log | grep duration
```

---

## Phase 4: Performance Testing & Validation - ALL PHASES

### Testing Throughout Implementation

- [ ] **Baseline Performance (Before Optimization)**
  - [ ] Record current response times:
    ```bash
    # Test product listing
    time curl "http://localhost:3000/api/products?page=1&limit=12"
    # Expected before: 500-1000ms
    # Expected after: 150-300ms
    ```
  - [ ] Record query count with logging
  - [ ] Record database CPU usage

- [ ] **Unit Tests**
  - [ ] Test money utilities
  - [ ] Test transaction logic
  - [ ] Test aggregation queries
  - **Command**: `npm run test`

- [ ] **Performance Tests**
  - [ ] Test individual endpoints
  - [ ] Verify N+1 queries fixed
  - [ ] Measure database round-trip times
  - [ ] **Create**: `__tests__/performance.test.ts`

- [ ] **Load Testing**
  - [ ] Install k6: `brew install k6`
  - [ ] Create load test scripts
  - [ ] Run with 50 virtual users
  - [ ] Monitor:
    - [ ] Response time under load
    - [ ] Error rates
    - [ ] Connection pool usage
    - [ ] Database CPU

- [ ] **Integration Tests**
  - [ ] Test order creation with transaction
  - [ ] Test cache invalidation
  - [ ] Test connection pooling with high concurrency
  - [ ] Simulate real traffic patterns

### Documentation

- [ ] **Update README.md** with:
  - [ ] Database optimization status
  - [ ] Performance improvements achieved
  - [ ] Connection pooling setup
  - [ ] Monitoring dashboards

- [ ] **Create PERFORMANCE.md** with:
  - [ ] Query optimization guidelines
  - [ ] Caching strategy
  - [ ] Index maintenance schedule
  - [ ] Troubleshooting guide

---

## Rollback Plans

### If Issues Occur

- [ ] **Index Issues**
  - [ ] Identify problematic index: `SELECT * FROM pg_stat_user_indexes ORDER BY idx_scan DESC;`
  - [ ] Drop if causing slowness: `DROP INDEX CONCURRENTLY idx_name;`
  - [ ] Revert schema: `git checkout prisma/schema.prisma`
  - [ ] Rollback migration: `npx prisma migrate resolve --rolled-back [migration-name]`

- [ ] **Connection Pool Issues**
  - [ ] Revert to direct connection: Update `.env` DATABASE_URL
  - [ ] Increase pool size if errors: `default_pool_size = 50`
  - [ ] Check for connection leaks

- [ ] **Cache Issues**
  - [ ] Disable Redis: Comment out cache calls
  - [ ] Clear cache: `redis-cli FLUSHALL`
  - [ ] Verify database queries working

---

## Success Criteria

### After Phase 1 (Must complete)
- [ ] All indexes created successfully
- [ ] N+1 queries eliminated
- [ ] Transaction logic working
- [ ] No data inconsistencies
- [ ] Performance baseline established

### After Phase 2 (Should complete)
- [ ] Connection pooling handling 5x+ more connections
- [ ] Money utilities preventing rounding errors
- [ ] Redis cache reducing load by 50%+
- [ ] Production environment configured

### After Phase 3 (Nice to have)
- [ ] Monitoring dashboard active
- [ ] Alerts firing for anomalies
- [ ] Batch processing queue operational
- [ ] Performance documentation complete

---

## Maintenance Schedule

### Weekly
- [ ] Monitor slow query logs
- [ ] Check index bloat: `SELECT * FROM pg_stat_user_indexes WHERE idx_blks_read > 0;`
- [ ] Verify cache hit rates

### Monthly
- [ ] `VACUUM ANALYZE;` on all tables
- [ ] Review query performance trends
- [ ] Rotate database backups

### Quarterly
- [ ] Reindex if bloat > 50%
- [ ] Update statistics: `ANALYZE;`
- [ ] Review and update indexes based on query patterns
- [ ] Performance audit

---

## Files Created by This Audit

### Documentation
- [x] `DATABASE_OPTIMIZATION_AUDIT.md` - Full audit report
- [x] `IMPLEMENTATION_CHECKLIST.md` - This file
- [x] `SCHEMA_OPTIMIZATIONS.prisma` - Recommended schema changes
- [x] `.env.production.example` - Production configuration

### Code Files
- [x] `lib/money.ts` - Money/decimal handling utilities
- [x] `lib/prisma-optimized.ts` - Optimized Prisma configuration
- [x] `prisma/migrations/002_add_performance_indexes.sql` - SQL migrations

### Next Steps
1. Review `DATABASE_OPTIMIZATION_AUDIT.md` completely
2. Start Phase 1 implementations
3. Test each change before moving to next
4. Document any deviations from plan
5. Measure performance improvements

