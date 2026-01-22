# Environment Variable Management Guide

**VIVR E-Commerce Platform**
**Version:** 1.0.0
**Updated:** January 21, 2026

---

## Table of Contents

1. [Overview](#overview)
2. [Environment Variables by Category](#environment-variables-by-category)
3. [Setup Instructions](#setup-instructions)
4. [Security Best Practices](#security-best-practices)
5. [Validation & Testing](#validation--testing)
6. [Secret Rotation](#secret-rotation)
7. [Troubleshooting](#troubleshooting)

---

## Overview

Environment variables configure VIVR for different deployment environments (development, staging, production). Proper management ensures security, consistency, and simplified operations.

### Environments

1. **Development** - Local machine, relaxed security
2. **Staging** - Pre-production testing, realistic data
3. **Production** - Live environment, strict security

### Storage Strategy

| Environment | Storage Method | Tools |
|-------------|---|---|
| Development | `.env.local` (git-ignored) | Local file |
| Staging | AWS Secrets Manager | AWS/Terraform |
| Production | AWS Secrets Manager | AWS/Terraform |

---

## Environment Variables by Category

### 1. Core Application

```bash
# Node.js runtime environment
NODE_ENV=production

# Next.js telemetry (disable in production)
NEXT_TELEMETRY_DISABLED=1

# API URL for client-side requests
NEXT_PUBLIC_API_URL=https://api.vivr.com
```

### 2. Database Configuration

```bash
# Primary database connection (for migrations, admin operations)
# Format: postgresql://user:password@host:port/database?schema=public&sslmode=require
DATABASE_URL=postgresql://vivr_user:secure_password@db.example.com:5432/vivr?schema=public&sslmode=require&connection_timeout=20

# Pooled connection (for application - via PgBouncer or RDS Proxy)
# Use connection pooling in production to handle concurrent requests
DATABASE_URL_POOLING=postgresql://vivr_user:secure_password@pgbouncer.example.com:6432/vivr?schema=public&sslmode=require&connection_limit=30&statement_cache_size=250

# Database query logging (disable in production)
LOG_QUERIES=false

# Slow query threshold in milliseconds
SLOW_QUERY_THRESHOLD=1000
```

**Important Notes:**
- Always use `sslmode=require` in production
- Connection pooling reduces connection overhead
- PgBouncer: `pool_mode=transaction` for application layer
- Connection limit depends on available resources

### 3. Authentication (NextAuth)

```bash
# NextAuth configuration URL (matches deployment domain)
NEXTAUTH_URL=https://vivr.example.com

# Secret for signing tokens and encrypting cookies
# Generate with: openssl rand -base64 32
NEXTAUTH_SECRET=your_very_long_random_secret_min_32_chars

# Custom session configuration
NEXTAUTH_SESSION_MAXAGE=2592000  # 30 days in seconds
NEXTAUTH_CALLBACK_URL=https://vivr.example.com/auth/callback

# JWT secret (should be different from NEXTAUTH_SECRET for extra security)
JWT_SECRET=your_jwt_secret_min_32_chars
```

**Generation:**
```bash
# Generate secure secrets
openssl rand -base64 32
```

### 4. OAuth Providers

```bash
# Google OAuth
GOOGLE_CLIENT_ID=your_client_id.apps.googleusercontent.com
GOOGLE_CLIENT_SECRET=your_client_secret

# Apple OAuth
APPLE_CLIENT_ID=com.vivr.app
APPLE_CLIENT_SECRET=your_apple_secret

# GitHub OAuth (optional)
GITHUB_CLIENT_ID=your_github_client_id
GITHUB_CLIENT_SECRET=your_github_client_secret
```

**Setup:**
- Google: https://console.cloud.google.com
- Apple: https://developer.apple.com/account
- GitHub: https://github.com/settings/developers

### 5. Payment Processing (Stripe)

```bash
# Stripe API keys
STRIPE_SECRET_KEY=sk_live_your_production_key_min_40_chars
STRIPE_PUBLISHABLE_KEY=pk_live_your_production_key_min_40_chars

# Webhook secret for validating Stripe events
STRIPE_WEBHOOK_SECRET=whsec_your_webhook_secret_min_40_chars

# Stripe configuration
STRIPE_API_VERSION=2023-10-16  # Match version in code
STRIPE_IDEMPOTENCY_KEY_ENABLED=true  # Prevent duplicate charges
```

**Production Checklist:**
- [ ] Switch from test keys to live keys
- [ ] Verify webhook endpoint signature
- [ ] Test payment flow end-to-end
- [ ] Configure webhook events: charge, charge.succeeded, charge.failed, payment_intent.succeeded
- [ ] Set up Stripe error alerts

### 6. PayPal (Optional)

```bash
# PayPal credentials
PAYPAL_CLIENT_ID=your_paypal_client_id
PAYPAL_CLIENT_SECRET=your_paypal_client_secret
PAYPAL_MODE=live  # or sandbox for testing
```

### 7. Email Configuration

```bash
# SMTP Server (SendGrid example)
SMTP_HOST=smtp.sendgrid.net
SMTP_PORT=587
SMTP_USER=apikey  # SendGrid uses 'apikey' as username
SMTP_PASSWORD=your_sendgrid_api_key

# Email Configuration
EMAIL_FROM=noreply@vivr.example.com
EMAIL_FROM_NAME=VIVR Team
EMAIL_REPLYTO=support@vivr.example.com

# Email templates
EMAIL_WELCOME_TEMPLATE=welcome
EMAIL_RESET_PASSWORD_TEMPLATE=reset-password
EMAIL_ORDER_CONFIRMATION_TEMPLATE=order-confirmation
```

**Email Providers:**
- SendGrid: High deliverability, good documentation
- AWS SES: Cost-effective, good for high volume
- Resend: Modern alternative, good for transactional
- Mailgun: Flexible API, detailed logs

### 8. Image Management (Cloudinary)

```bash
# Cloudinary credentials
CLOUDINARY_CLOUD_NAME=your_cloud_name
CLOUDINARY_API_KEY=your_api_key
CLOUDINARY_API_SECRET=your_api_secret

# Cloudinary configuration
CLOUDINARY_SECURE_UPLOAD=true  # Always use HTTPS
CLOUDINARY_AUTO_TAGGING=true   # Optional: auto categorize images
```

### 9. Caching (Redis)

```bash
# Redis connection string
REDIS_URL=redis://redis.example.com:6379

# Redis authentication (if required)
REDIS_TOKEN=your_redis_password
REDIS_TLS=true  # Use TLS in production

# Cache configuration
REDIS_CACHE_TTL=3600  # Default cache time: 1 hour
REDIS_SESSION_CACHE_TTL=86400  # Session cache: 24 hours
```

### 10. Error Tracking (Sentry)

```bash
# Sentry configuration
SENTRY_DSN=https://your-key@sentry.io/project-id
SENTRY_ENV=production
SENTRY_TRACE_SAMPLE_RATE=0.1  # 10% of transactions
SENTRY_REPLAY_SESSION_SAMPLE_RATE=0.1
SENTRY_REPLAY_ON_ERROR_SAMPLE_RATE=1.0  # All errors
SENTRY_RELEASE=1.0.0
```

### 11. Application Performance Monitoring (DataDog)

```bash
# DataDog configuration
DATADOG_ENABLED=true
DD_SERVICE=vivr-api
DD_ENV=production
DD_VERSION=1.0.0
DD_API_KEY=your_datadog_api_key
DD_SITE=datadoghq.com

# APM configuration
DD_TRACE_SAMPLE_RATE=0.1
DD_LOGS_INJECTION=true
```

### 12. Analytics & Monitoring

```bash
# Google Analytics
NEXT_PUBLIC_GA_ID=G_XXXXXXXXXX

# Mixpanel
NEXT_PUBLIC_MIXPANEL_TOKEN=your_mixpanel_token

# Custom Analytics
ANALYTICS_ENABLED=true
ANALYTICS_DEBUG=false
```

### 13. Feature Flags (Optional)

```bash
# LaunchDarkly
NEXT_PUBLIC_LAUNCHDARKLY_CLIENT_ID=your_client_id
LAUNCHDARKLY_SDK_KEY=your_sdk_key

# Custom feature flags
FEATURE_NEW_CHECKOUT=false
FEATURE_PRODUCT_REVIEWS=true
FEATURE_WISHLIST=true
```

### 14. Security & Compliance

```bash
# CORS configuration
CORS_ALLOWED_ORIGINS=https://vivr.example.com,https://admin.vivr.example.com

# Rate limiting
RATE_LIMIT_REQUESTS=100  # Requests per window
RATE_LIMIT_WINDOW_MS=900000  # 15 minutes

# Password policy
PASSWORD_MIN_LENGTH=8
PASSWORD_REQUIRE_NUMBERS=true
PASSWORD_REQUIRE_SPECIAL=true

# Session security
SECURE_COOKIES=true
HTTP_ONLY_COOKIES=true
SAME_SITE_COOKIES=strict
```

---

## Setup Instructions

### Development Setup

1. **Create local environment file:**
```bash
cp .env.example .env.local
```

2. **Edit `.env.local` with development values:**
```bash
NODE_ENV=development
NEXTAUTH_URL=http://localhost:3000
NEXTAUTH_SECRET=dev_secret_not_secure_change_in_prod
DATABASE_URL=postgresql://vivr_user:dev_password@localhost:5432/vivr
REDIS_URL=redis://localhost:6379
# ... add other services
```

3. **Verify setup:**
```bash
npm run db:generate
npm run dev
```

### Staging Setup (AWS Secrets Manager)

1. **Create secrets in AWS Secrets Manager:**
```bash
aws secretsmanager create-secret \
  --name vivr/staging \
  --description "VIVR Staging Environment" \
  --secret-string file://staging-secrets.json
```

2. **Example `staging-secrets.json`:**
```json
{
  "DATABASE_URL": "postgresql://vivr_user:password@staging-db.rds.amazonaws.com:5432/vivr",
  "NEXTAUTH_SECRET": "staging_secret_value",
  "STRIPE_SECRET_KEY": "sk_test_xxx",
  "REDIS_URL": "redis://staging-redis.elasticache.amazonaws.com:6379"
}
```

3. **Update deployment configuration to fetch from Secrets Manager**

### Production Setup (AWS Secrets Manager)

1. **Create production secrets:**
```bash
aws secretsmanager create-secret \
  --name vivr/production \
  --description "VIVR Production Environment" \
  --secret-string file://production-secrets.json \
  --kms-key-id arn:aws:kms:region:account:key/id
```

2. **Restrict access with IAM policy**

3. **Enable automatic rotation:**
```bash
aws secretsmanager rotate-secret \
  --secret-id vivr/production \
  --rotation-rules AutomaticallyAfterDays=30
```

---

## Security Best Practices

### 1. Secret Generation

```bash
# Generate 32-character secrets
openssl rand -base64 32

# Generate 64-character secrets
openssl rand -base64 64

# Generate cryptographically secure random strings
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
```

### 2. Storage Security

**DO:**
- Store secrets in AWS Secrets Manager
- Use KMS encryption for secrets
- Enable audit logging for secret access
- Restrict IAM access by principle of least privilege
- Use separate secrets for each environment

**DON'T:**
- Commit secrets to Git repository
- Hardcode secrets in application code
- Use same secret across environments
- Share secrets via unencrypted channels
- Log sensitive values

### 3. Access Control

**IAM Policy Example:**
```json
{
  "Version": "2012-10-17",
  "Statement": [
    {
      "Effect": "Allow",
      "Action": [
        "secretsmanager:GetSecretValue"
      ],
      "Resource": "arn:aws:secretsmanager:region:account:secret:vivr/production*",
      "Condition": {
        "StringEquals": {
          "aws:SourceVpc": "vpc-xxxxx"
        }
      }
    }
  ]
}
```

### 4. Secret Scanning

```bash
# Scan repository for exposed secrets
npm install -g detect-secrets
detect-secrets scan

# Use GitHub's native secret scanning (enable in repository settings)
```

### 5. Environment Variable Validation

```typescript
// lib/validate-env.ts
function validateEnvironment() {
  const required = [
    'DATABASE_URL',
    'NEXTAUTH_SECRET',
    'STRIPE_SECRET_KEY',
    'REDIS_URL'
  ];

  const missing = required.filter(key => !process.env[key]);

  if (missing.length > 0) {
    throw new Error(`Missing required environment variables: ${missing.join(', ')}`);
  }
}

// Call at app startup
if (process.env.NODE_ENV === 'production') {
  validateEnvironment();
}
```

---

## Validation & Testing

### Startup Validation

```typescript
// app/layout.tsx
import { validateEnvironment } from '@/lib/validate-env'

export default function RootLayout() {
  if (typeof window === 'undefined') {
    validateEnvironment()
  }
  // ...
}
```

### Health Check Endpoint

```typescript
// app/api/health/route.ts
export async function GET() {
  try {
    // Verify database connection
    await prisma.user.count()

    // Verify Redis connection
    await redis.ping()

    // Verify Stripe API key
    if (process.env.STRIPE_SECRET_KEY) {
      await stripe.apiKeys.list()
    }

    return Response.json({
      status: 'healthy',
      environment: process.env.NODE_ENV,
      timestamp: new Date().toISOString()
    })
  } catch (error) {
    return Response.json(
      {
        status: 'unhealthy',
        error: error.message
      },
      { status: 503 }
    )
  }
}
```

---

## Secret Rotation

### Rotation Schedule

| Secret | Frequency | Method |
|--------|-----------|--------|
| Database password | 90 days | AWS RDS |
| API keys | 180 days | Manual |
| OAuth secrets | 180 days | Manual |
| JWT secret | 90 days | Manual |

### Rotation Process

1. **Create new secret in Secrets Manager**
2. **Update application configuration**
3. **Test new secret in staging**
4. **Deploy to production**
5. **Revoke old secret (wait 24 hours)**

### Automated Rotation Script

```bash
#!/bin/bash
# scripts/rotate-secrets.sh

SECRET_NAME="vivr/production"
DAYS_UNTIL_ROTATION=30

# Check if rotation is needed
LAST_ROTATION=$(aws secretsmanager describe-secret --secret-id $SECRET_NAME --query CreatedDate)
DAYS_SINCE=$(( ($(date +%s) - $(date -d "$LAST_ROTATION" +%s)) / 86400 ))

if [ $DAYS_SINCE -gt $DAYS_UNTIL_ROTATION ]; then
  echo "Rotating secrets..."

  # Generate new secrets
  NEW_SECRET=$(aws secretsmanager generate-random-password --password-length 32)

  # Update in Secrets Manager
  aws secretsmanager update-secret \
    --secret-id $SECRET_NAME \
    --secret-string "$NEW_SECRET"

  # Trigger deployment
  echo "Deployment will use new secrets"
fi
```

---

## Troubleshooting

### Missing Environment Variables

```bash
# Check which variables are missing
node -e "
  const required = ['DATABASE_URL', 'NEXTAUTH_SECRET'];
  const missing = required.filter(k => !process.env[k]);
  console.log('Missing:', missing);
"

# List all environment variables
env | grep -E '^(DATABASE|NEXTAUTH|STRIPE)'
```

### Database Connection Issues

```bash
# Test database connection
psql $DATABASE_URL -c "SELECT 1"

# Check connection pooling
psql $DATABASE_URL -c "SELECT datname, count(*) FROM pg_stat_activity GROUP BY datname;"

# Verify SSL mode
psql $DATABASE_URL -c "SHOW ssl;"
```

### Secret Access Issues

```bash
# Verify IAM permissions
aws secretsmanager get-secret-value \
  --secret-id vivr/production \
  --query SecretString

# Check CloudTrail logs for access
aws cloudtrail lookup-events \
  --lookup-attributes AttributeKey=ResourceName,AttributeValue=vivr/production
```

### Redis Connection Issues

```bash
# Test Redis connection
redis-cli -u $REDIS_URL ping

# Check Redis keys
redis-cli -u $REDIS_URL KEYS '*'

# Verify Redis memory
redis-cli -u $REDIS_URL INFO memory
```

---

## Checklist

**Before Production Deployment:**

- [ ] All required environment variables defined
- [ ] Secrets stored in AWS Secrets Manager with encryption
- [ ] IAM policies restrict access appropriately
- [ ] Secrets Manager audit logging enabled
- [ ] Health check endpoint verifies all services
- [ ] Environment validation code in place
- [ ] Secret rotation schedule established
- [ ] Team trained on secret management
- [ ] Monitoring alerts configured for unauthorized access
- [ ] Documentation updated with actual values (never commit)

---

**Last Updated:** January 21, 2026
**Review Schedule:** Monthly
**Next Review:** February 21, 2026
