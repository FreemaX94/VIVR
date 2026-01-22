# Database Migration & Backup Strategy

**VIVR E-Commerce Platform**
**Version:** 1.0.0
**Updated:** January 21, 2026

---

## Table of Contents

1. [Migration Strategy](#migration-strategy)
2. [Zero-Downtime Migrations](#zero-downtime-migrations)
3. [Backup Strategy](#backup-strategy)
4. [Disaster Recovery](#disaster-recovery)
5. [Monitoring & Verification](#monitoring--verification)
6. [Scripts & Automation](#scripts--automation)

---

## Migration Strategy

### Prisma Migration Workflow

**Local Development:**
```bash
# Create new migration after schema changes
npx prisma migrate dev --name add_new_feature

# This does:
# 1. Creates migration file in prisma/migrations/
# 2. Applies to local database
# 3. Regenerates Prisma client
```

**Staging/Production:**
```bash
# Deploy migration without prompting
npx prisma migrate deploy --skip-generate

# Verify migration success
npx prisma db execute --stdin < scripts/verify-migration.sql
```

### Migration Checklist

**Before Migration (T-24 hours):**
- [ ] Test migration on staging with production-like data
- [ ] Verify rollback procedure works
- [ ] Notify stakeholders of maintenance window
- [ ] Prepare communication template
- [ ] Back up production database (S3)
- [ ] Review migration file for correctness
- [ ] Identify affected tables/queries

**Before Migration (T-1 hour):**
- [ ] Drain connection pool
- [ ] Enable read-only mode on application
- [ ] Verify database backup completed
- [ ] Confirm team availability for incident response
- [ ] Start monitoring high-resolution dashboards

**During Migration:**
- [ ] Execute migration with timeout monitoring
- [ ] Monitor database locks
- [ ] Check error logs
- [ ] Verify data integrity post-migration

**After Migration (T+1 hour):**
- [ ] Re-enable application write mode
- [ ] Run smoke tests
- [ ] Verify performance metrics
- [ ] Monitor error rates
- [ ] Update documentation

### Common Migration Patterns

**Adding a Column with Default:**
```prisma
model Product {
  // ... existing fields
  featured      Boolean     @default(false)  // Safe: has default
}
```

**Adding Required Column (Risky):**
```prisma
// Stage 1: Add as optional
model Product {
  metadata      String?     @default("{}") @db.Text
}

// Deploy to production
// Stage 2: Populate existing rows
UPDATE Product SET metadata = '{}' WHERE metadata IS NULL;

// Stage 3: Make required
model Product {
  metadata      String      @default("{}") @db.Text
}

// Deploy to production
```

**Renaming Column:**
```prisma
// Use migration SQL directly for safety
-- CREATE TABLE Product_new LIKE Product;
-- ALTER TABLE Product_new ADD COLUMN new_name VARCHAR(255);
-- UPDATE Product_new SELECT *, old_name AS new_name FROM Product;
-- DROP TABLE Product;
-- RENAME TABLE Product_new TO Product;
```

**Creating Index Safely:**
```prisma
model Order {
  userId      String
  createdAt   DateTime

  // Add index - safe for large tables
  @@index([userId, createdAt])
}
```

---

## Zero-Downtime Migrations

### Principles

1. **Backwards compatibility** - Old code must work with new schema
2. **Gradual rollout** - Migrations don't affect all users at once
3. **Rollback capability** - Can revert without data loss
4. **Monitoring** - Watch for issues during transition

### Implementation

**Step 1: Deploy Code Supporting Both Versions**
```typescript
// app/api/orders/route.ts
export async function GET() {
  const orders = await prisma.order.findMany({
    include: {
      items: true,
      // Support both old and new fields
      user: {
        select: {
          id: true,
          email: true,
          // Handle optional new field gracefully
          preferences: true
        }
      }
    }
  })

  return Response.json(orders.map(order => ({
    ...order,
    // Provide default for new fields
    user: {
      ...order.user,
      preferences: order.user.preferences || {}
    }
  })))
}
```

**Step 2: Run Database Migration**
```bash
# During low-traffic period
npx prisma migrate deploy

# Monitor closely
./scripts/verify-migration.sh
```

**Step 3: Deploy Code Using New Fields**
```typescript
// Now safe to use new fields
export async function POST(req: Request) {
  const data = await req.json()

  const order = await prisma.order.create({
    data: {
      userId: data.userId,
      items: {
        create: data.items
      },
      // Use new field
      preferences: data.preferences || {}
    }
  })

  return Response.json(order)
}
```

**Step 4: Clean Up Old Code**
```typescript
// Remove backwards compatibility code
// Only after confirming new code is stable
```

---

## Backup Strategy

### Backup Types

| Type | Frequency | Retention | Use Case |
|------|-----------|-----------|----------|
| Automated snapshot | Daily | 30 days | Point-in-time recovery |
| Manual backup | Before migrations | 90 days | Safety net for changes |
| Archive backup | Monthly | 1 year | Compliance, audit |
| Cross-region backup | Daily | 30 days | Disaster recovery |

### RDS Automated Backups

**Configuration:**
```bash
aws rds modify-db-instance \
  --db-instance-identifier vivr-db \
  --backup-retention-period 30 \
  --preferred-backup-window "03:00-04:00" \
  --preferred-maintenance-window "sun:04:00-sun:05:00" \
  --copy-tags-to-snapshot \
  --enable-cloudwatch-logs-exports postgresql \
  --apply-immediately
```

### Manual Backup Script

```bash
#!/bin/bash
# scripts/backup-database.sh

TIMESTAMP=$(date +%Y%m%d_%H%M%S)
BACKUP_NAME="vivr_backup_${TIMESTAMP}"
DB_HOST="${DATABASE_HOST:-localhost}"
DB_USER="${DB_USER:-vivr_user}"
DB_NAME="vivr"
S3_BUCKET="vivr-backups"

echo "Starting database backup: $BACKUP_NAME"

# Full backup
pg_dump \
  -h "$DB_HOST" \
  -U "$DB_USER" \
  -Fc \
  -v \
  --no-acl \
  --no-owner \
  --jobs=4 \
  "$DB_NAME" | \
  aws s3 cp - "s3://$S3_BUCKET/full_backups/${BACKUP_NAME}.dump"

if [ $? -eq 0 ]; then
  echo "Backup completed successfully: ${BACKUP_NAME}.dump"

  # Create metadata file
  echo "{\"timestamp\": \"$(date -u +%Y-%m-%dT%H:%M:%SZ)\", \"size\": \"$(aws s3api head-object --bucket $S3_BUCKET --key full_backups/${BACKUP_NAME}.dump --query ContentLength --output text)\"}" > /tmp/backup_metadata.json

  aws s3 cp /tmp/backup_metadata.json "s3://$S3_BUCKET/full_backups/${BACKUP_NAME}.json"

  # Send notification
  aws sns publish \
    --topic-arn "arn:aws:sns:us-east-1:account:database-backups" \
    --message "Database backup completed: ${BACKUP_NAME}"
else
  echo "Backup failed!"
  aws sns publish \
    --topic-arn "arn:aws:sns:us-east-1:account:alerts" \
    --message "CRITICAL: Database backup failed for $TIMESTAMP" \
    --subject "Database Backup Failure"
  exit 1
fi
```

### Backup Schedule

**Daily Backups:**
```bash
# Add to crontab
0 2 * * * /opt/scripts/backup-database.sh > /var/log/backup.log 2>&1
```

**Weekly Verification:**
```bash
# Test restore on staging (weekly)
0 3 * * 0 /opt/scripts/verify-backup.sh
```

---

## Disaster Recovery

### RTO & RPO Targets

| Scenario | RTO | RPO | Recovery Procedure |
|----------|-----|-----|-------------------|
| Database unavailable | 15 min | 1 hour | Restore from snapshot |
| Data corruption | 30 min | 1 hour | Restore and verify |
| Region failure | 1 hour | 1 hour | Failover to replica |
| Complete data loss | 4 hours | 24 hours | Restore from archive |

### Recovery from Snapshot

```bash
#!/bin/bash
# scripts/restore-from-snapshot.sh

SNAPSHOT_ID="$1"
NEW_INSTANCE_ID="vivr-db-restored-$(date +%Y%m%d%H%M%S)"

echo "Restoring from snapshot: $SNAPSHOT_ID"

# Create new instance from snapshot
aws rds restore-db-instance-from-db-snapshot \
  --db-instance-identifier "$NEW_INSTANCE_ID" \
  --db-snapshot-identifier "$SNAPSHOT_ID" \
  --db-instance-class db.t3.small \
  --publicly-accessible false \
  --no-multi-az \
  --storage-type gp3 \
  --allocated-storage 100 \
  --backup-retention-period 7

# Wait for instance to be available
aws rds wait db-instance-available \
  --db-instance-identifier "$NEW_INSTANCE_ID"

echo "Restored instance available: $NEW_INSTANCE_ID"
echo "Update CONNECTION string and test connectivity"
echo "Endpoint: $(aws rds describe-db-instances --db-instance-identifier $NEW_INSTANCE_ID --query DBInstances[0].Endpoint.Address --output text)"
```

### Recovery from S3 Backup

```bash
#!/bin/bash
# scripts/restore-from-s3-backup.sh

BACKUP_FILE="$1"  # s3://bucket/full_backups/vivr_backup_20260121.dump
DB_HOST="${2:-localhost}"
DB_USER="${3:-vivr_user}"
DB_NAME="vivr"

echo "Restoring from S3 backup: $BACKUP_FILE"

# Download and restore
aws s3 cp "$BACKUP_FILE" - | \
  pg_restore \
    -h "$DB_HOST" \
    -U "$DB_USER" \
    -d "$DB_NAME" \
    -v \
    --jobs=4 \
    --role="$DB_USER" \
    --exit-on-error

if [ $? -eq 0 ]; then
  echo "Restore completed successfully"

  # Verify restore
  psql -h "$DB_HOST" -U "$DB_USER" -d "$DB_NAME" \
    -c "SELECT COUNT(*) as order_count FROM \"Order\";" \
    -c "SELECT COUNT(*) as product_count FROM \"Product\";"
else
  echo "Restore failed!"
  exit 1
fi
```

### Failover Procedure

```bash
#!/bin/bash
# scripts/failover-to-replica.sh

PRIMARY_ID="vivr-db-primary"
REPLICA_ID="vivr-db-replica"

echo "Initiating failover from $PRIMARY_ID to $REPLICA_ID"

# Promote replica to standalone instance
aws rds promote-read-replica \
  --db-instance-identifier "$REPLICA_ID" \
  --backup-retention-period 7

# Wait for promotion
aws rds wait db-instance-available \
  --db-instance-identifier "$REPLICA_ID"

# Get new endpoint
NEW_ENDPOINT=$(aws rds describe-db-instances \
  --db-instance-identifier "$REPLICA_ID" \
  --query DBInstances[0].Endpoint.Address \
  --output text)

echo "Failover completed"
echo "New primary endpoint: $NEW_ENDPOINT"
echo "Update DATABASE_URL to: postgresql://user:pass@${NEW_ENDPOINT}:5432/vivr"
```

---

## Monitoring & Verification

### Backup Verification

```bash
#!/bin/bash
# scripts/verify-migration.sql

-- Verify table structure
SELECT table_name, column_name, data_type
FROM information_schema.columns
WHERE table_schema = 'public'
ORDER BY table_name, ordinal_position;

-- Verify row counts
SELECT
  schemaname,
  tablename,
  n_live_tup as row_count,
  n_dead_tup as dead_rows
FROM pg_stat_user_tables
ORDER BY n_live_tup DESC;

-- Verify indexes
SELECT
  schemaname,
  tablename,
  indexname,
  idx_scan as scan_count
FROM pg_stat_user_indexes
ORDER BY idx_scan DESC;

-- Check for table bloat
SELECT
  schemaname,
  tablename,
  ROUND(pg_size_pretty(pg_total_relation_size(schemaname||'.'||tablename))::numeric)
FROM pg_tables
WHERE schemaname = 'public'
ORDER BY pg_total_relation_size(schemaname||'.'||tablename) DESC;

-- Verify no slow queries created
SELECT
  query,
  calls,
  mean_exec_time,
  total_exec_time
FROM pg_stat_statements
WHERE mean_exec_time > 1000
ORDER BY mean_exec_time DESC
LIMIT 10;
```

### Health Check Script

```typescript
// scripts/verify-production-health.ts
import prisma from '@/lib/prisma'

async function verifyProductionHealth() {
  console.log('Verifying production database health...')

  try {
    // Check basic connectivity
    const count = await prisma.order.count()
    console.log(`✓ Database connected. Total orders: ${count}`)

    // Check recent data
    const recentOrder = await prisma.order.findFirst({
      orderBy: { createdAt: 'desc' }
    })
    console.log(`✓ Most recent order: ${recentOrder?.orderNumber}`)

    // Check indexes
    const indexStatus = await prisma.$queryRaw`
      SELECT schemaname, tablename, indexname, idx_scan
      FROM pg_stat_user_indexes
      WHERE idx_scan = 0
      LIMIT 5
    `
    console.log('✓ Index usage verified')

    // Check connection count
    const connections = await prisma.$queryRaw`
      SELECT count(*) as active_connections
      FROM pg_stat_activity
    `
    console.log(`✓ Active connections: ${connections[0].active_connections}`)

    console.log('\n✓ All health checks passed!')
    return true
  } catch (error) {
    console.error('✗ Health check failed:', error)
    process.exit(1)
  }
}

verifyProductionHealth()
```

### Automated Backup Verification

```bash
#!/bin/bash
# scripts/verify-backup.sh

BACKUP_FILE="$1"
TEST_DB="vivr_test"
TEST_USER="test_user"

echo "Testing backup restore: $BACKUP_FILE"

# Create test database
createdb -U postgres "$TEST_DB"

# Restore backup
aws s3 cp "$BACKUP_FILE" - | pg_restore \
  -U postgres \
  -d "$TEST_DB" \
  --exit-on-error \
  2>/dev/null

if [ $? -ne 0 ]; then
  echo "✗ Restore failed"
  dropdb -U postgres "$TEST_DB"
  exit 1
fi

# Run verification queries
psql -U postgres -d "$TEST_DB" -c "SELECT COUNT(*) FROM \"Order\"" > /dev/null
psql -U postgres -d "$TEST_DB" -c "SELECT COUNT(*) FROM \"Product\"" > /dev/null
psql -U postgres -d "$TEST_DB" -c "SELECT COUNT(*) FROM \"User\"" > /dev/null

if [ $? -eq 0 ]; then
  echo "✓ Backup verified successfully"
  dropdb -U postgres "$TEST_DB"
  exit 0
else
  echo "✗ Verification queries failed"
  dropdb -U postgres "$TEST_DB"
  exit 1
fi
```

---

## Scripts & Automation

### GitHub Actions Workflow

```yaml
# .github/workflows/database-backup.yml
name: Database Backup

on:
  schedule:
    - cron: '0 2 * * *'  # Daily at 2 AM

jobs:
  backup:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4

      - name: Configure AWS credentials
        uses: aws-actions/configure-aws-credentials@v2
        with:
          role-to-assume: arn:aws:iam::ACCOUNT:role/github-actions
          aws-region: us-east-1

      - name: Backup database
        run: ./scripts/backup-database.sh
        env:
          DATABASE_HOST: ${{ secrets.PROD_DB_HOST }}
          DB_USER: ${{ secrets.PROD_DB_USER }}
          DB_PASSWORD: ${{ secrets.PROD_DB_PASSWORD }}

      - name: Verify backup
        run: ./scripts/verify-backup.sh

      - name: Notify on failure
        if: failure()
        uses: slackapi/slack-github-action@v1
        with:
          payload: |
            {"text": "Database backup failed"}
```

---

## Checklist

**Before Production:**
- [ ] Backup retention policy defined (30-90 days)
- [ ] Automated daily backups configured
- [ ] Weekly backup verification scheduled
- [ ] RDS Multi-AZ enabled
- [ ] Cross-region backup replication enabled
- [ ] Disaster recovery runbook created
- [ ] Recovery procedures tested
- [ ] Team trained on backup/restore procedures
- [ ] Monitoring alerts for failed backups
- [ ] Encryption at rest enabled

---

**Last Updated:** January 21, 2026
