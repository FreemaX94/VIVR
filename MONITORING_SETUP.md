# Monitoring & Observability Setup Guide

**VIVR E-Commerce Platform**
**Version:** 1.0.0
**Updated:** January 21, 2026

---

## Table of Contents

1. [Overview](#overview)
2. [Health Checks](#health-checks)
3. [Application Monitoring (APM)](#application-monitoring-apm)
4. [Error Tracking](#error-tracking)
5. [Logging Strategy](#logging-strategy)
6. [Metrics & Dashboards](#metrics--dashboards)
7. [Alerting](#alerting)
8. [Implementation](#implementation)

---

## Overview

### Monitoring Stack

```
Application → Logs → CloudWatch/Datadog
         ↓
       APM → Datadog/New Relic
         ↓
       Errors → Sentry
         ↓
      Metrics → Prometheus/CloudWatch
         ↓
     Dashboard → Grafana/CloudWatch
```

### Goals

1. **Detect issues proactively** before users notice
2. **Understand application behavior** in production
3. **Optimize performance** based on real data
4. **Comply with SLAs** (99.9% availability)
5. **Quick incident response** with detailed context

---

## Health Checks

### Application Health Endpoint

```typescript
// app/api/health/route.ts
import prisma from '@/lib/prisma'
import redis from '@/lib/redis'
import { stripe } from '@/lib/stripe'

interface HealthCheck {
  status: 'healthy' | 'degraded' | 'unhealthy'
  timestamp: string
  uptime: number
  environment: string
  version: string
  checks: {
    [key: string]: {
      status: 'ok' | 'degraded' | 'error'
      latency: number
      message?: string
    }
  }
  metrics?: {
    memoryUsage: number
    cpuUsage: number
    requestsPerSecond: number
  }
}

export async function GET(req: Request): Promise<Response> {
  const startTime = Date.now()
  const checks: HealthCheck['checks'] = {}

  try {
    // Database health check
    const dbStart = Date.now()
    try {
      await prisma.$queryRaw`SELECT 1`
      checks.database = {
        status: 'ok',
        latency: Date.now() - dbStart
      }
    } catch (error) {
      checks.database = {
        status: 'error',
        latency: Date.now() - dbStart,
        message: error.message
      }
    }

    // Redis health check
    const redisStart = Date.now()
    try {
      await redis.ping()
      checks.cache = {
        status: 'ok',
        latency: Date.now() - redisStart
      }
    } catch (error) {
      checks.cache = {
        status: 'error',
        latency: Date.now() - redisStart,
        message: error.message
      }
    }

    // Stripe API health check
    const stripeStart = Date.now()
    try {
      if (process.env.STRIPE_SECRET_KEY) {
        // Light Stripe API call
        await stripe.balance.retrieve()
        checks.payment = {
          status: 'ok',
          latency: Date.now() - stripeStart
        }
      } else {
        checks.payment = {
          status: 'degraded',
          latency: 0,
          message: 'Stripe not configured'
        }
      }
    } catch (error) {
      checks.payment = {
        status: 'error',
        latency: Date.now() - stripeStart,
        message: error.message
      }
    }

    // Determine overall status
    const errorCount = Object.values(checks).filter(c => c.status === 'error').length
    const overallStatus = errorCount === 0 ? 'healthy' : errorCount === 1 ? 'degraded' : 'unhealthy'

    const response: HealthCheck = {
      status: overallStatus,
      timestamp: new Date().toISOString(),
      uptime: process.uptime(),
      environment: process.env.NODE_ENV || 'unknown',
      version: process.env.APP_VERSION || '1.0.0',
      checks,
      metrics: {
        memoryUsage: process.memoryUsage().heapUsed / 1024 / 1024,
        cpuUsage: process.cpuUsage().user / 1000,
        requestsPerSecond: 0 // Track separately
      }
    }

    return Response.json(response, {
      status: overallStatus === 'unhealthy' ? 503 : 200,
      headers: {
        'Content-Type': 'application/json',
        'Cache-Control': 'no-cache, no-store, must-revalidate'
      }
    })
  } catch (error) {
    return Response.json(
      {
        status: 'unhealthy',
        error: error.message,
        timestamp: new Date().toISOString()
      },
      { status: 503 }
    )
  }
}
```

### Load Balancer Health Check Configuration

**AWS ALB Health Check:**
```
Protocol: HTTP
Path: /api/health
Port: 3000
Interval: 30 seconds
Timeout: 5 seconds
Healthy threshold: 2 consecutive successes
Unhealthy threshold: 2 consecutive failures
```

---

## Application Monitoring (APM)

### Datadog Integration

**Installation:**
```bash
npm install @datadog/browser-rum @datadog/browser-logs
```

**Client-side Setup:**
```typescript
// lib/datadog.ts
import { datadogRum } from '@datadog/browser-rum'
import { datadogLogs } from '@datadog/browser-logs'

export function initializeDatadog() {
  if (process.env.NODE_ENV !== 'production') {
    return
  }

  datadogRum.init({
    applicationId: process.env.NEXT_PUBLIC_DATADOG_APP_ID!,
    clientToken: process.env.NEXT_PUBLIC_DATADOG_CLIENT_TOKEN!,
    site: 'datadoghq.com',
    service: 'vivr-frontend',
    env: process.env.NODE_ENV,
    version: process.env.NEXT_PUBLIC_APP_VERSION,
    sessionSampleRate: 100,
    sessionReplaySampleRate: 100,
    trackUserInteractions: true,
    trackResources: true,
    trackLongTasks: true,
    defaultPrivacyLevel: 'mask-user-input'
  })

  datadogRum.startSessionReplayRecording()

  // Initialize logs
  datadogLogs.init({
    clientToken: process.env.NEXT_PUBLIC_DATADOG_CLIENT_TOKEN!,
    site: 'datadoghq.com',
    service: 'vivr-frontend',
    env: process.env.NODE_ENV,
    sessionSampleRate: 100,
    forwardErrorsToLogs: true,
    level: 'info'
  })
}

// Use in app
// app/layout.tsx
useEffect(() => {
  initializeDatadog()
}, [])
```

**Server-side Setup:**
```typescript
// lib/server-datadog.ts
import { StatsD } from 'node-dogstatsd'

const dog = new StatsD({
  host: process.env.DD_AGENT_HOST || 'localhost',
  port: parseInt(process.env.DD_AGENT_PORT || '8125'),
  prefix: 'vivr.',
  tags: [
    `env:${process.env.NODE_ENV}`,
    `service:vivr-api`,
    `version:${process.env.APP_VERSION}`
  ]
})

export const metricsClient = {
  increment: (metric: string, value: number = 1, tags?: string[]) => {
    dog.increment(metric, value, tags)
  },
  gauge: (metric: string, value: number, tags?: string[]) => {
    dog.gauge(metric, value, tags)
  },
  timing: (metric: string, duration: number, tags?: string[]) => {
    dog.timing(metric, duration, tags)
  },
  histogram: (metric: string, value: number, tags?: string[]) => {
    dog.histogram(metric, value, tags)
  }
}
```

### Metrics to Track

**Request Metrics:**
```typescript
// middleware/metrics.ts
import { NextRequest, NextResponse } from 'next/server'
import { metricsClient } from '@/lib/server-datadog'

export function middleware(request: NextRequest) {
  const start = Date.now()
  const pathname = request.nextUrl.pathname

  // Track request initiated
  metricsClient.increment('http.requests', 1, [
    `endpoint:${pathname}`,
    `method:${request.method}`
  ])

  return NextResponse.next()
}
```

**Performance Metrics:**
```typescript
// lib/performance.ts
export function trackMetric(name: string, value: number, tags?: Record<string, string>) {
  if (process.env.NODE_ENV === 'production') {
    metricsClient.histogram(name, value, Object.entries(tags || {}).map(([k, v]) => `${k}:${v}`))
  }
}

// Usage in API route
const queryStart = Date.now()
const result = await prisma.product.findMany()
trackMetric('database.query.duration', Date.now() - queryStart, { table: 'product' })
```

---

## Error Tracking

### Sentry Integration

**Installation:**
```bash
npm install @sentry/nextjs
```

**Configuration:**
```typescript
// sentry.client.config.ts
import * as Sentry from "@sentry/nextjs"

Sentry.init({
  dsn: process.env.NEXT_PUBLIC_SENTRY_DSN,
  environment: process.env.NODE_ENV,
  integrations: [
    new Sentry.Replay({
      maskAllText: true,
      blockAllMedia: true
    })
  ],
  tracesSampleRate: 0.1,
  replaysSessionSampleRate: 0.1,
  replaysOnErrorSampleRate: 1.0,
  beforeSend(event, hint) {
    // Filter out certain errors
    if (event.exception) {
      const error = hint.originalException as Error
      // Ignore network errors from monitoring
      if (error.message?.includes('Network request failed')) {
        return null
      }
    }
    // Redact sensitive data
    if (event.request?.headers) {
      delete event.request.headers['authorization']
      delete event.request.headers['cookie']
    }
    return event
  }
})
```

**Server-side Configuration:**
```typescript
// sentry.server.config.ts
import * as Sentry from "@sentry/nextjs"

Sentry.init({
  dsn: process.env.SENTRY_DSN,
  environment: process.env.NODE_ENV,
  tracesSampleRate: 0.1,
  integrations: [
    new Sentry.Prisma(),
  ],
  beforeSend(event, hint) {
    // Filter production errors
    if (event.level === 'error' && process.env.NODE_ENV === 'production') {
      // Send critical errors only if they match patterns
      if (!isCriticalError(hint.originalException)) {
        return null
      }
    }
    return event
  }
})

function isCriticalError(error: unknown): boolean {
  if (!(error instanceof Error)) return false

  return /database|payment|auth|security/i.test(error.message)
}
```

**API Error Handler:**
```typescript
// app/api/error-handler.ts
import * as Sentry from "@sentry/nextjs"

export function handleApiError(error: unknown, context: { route: string; userId?: string }) {
  const err = error instanceof Error ? error : new Error(String(error))

  Sentry.captureException(err, {
    tags: {
      type: 'api_error',
      route: context.route
    },
    extra: {
      userId: context.userId
    },
    level: err.message.includes('Database') ? 'error' : 'info'
  })

  return {
    error: process.env.NODE_ENV === 'production' ? 'Internal Server Error' : err.message,
    requestId: Sentry.lastEventId()
  }
}
```

---

## Logging Strategy

### Structured Logging

```typescript
// lib/logger.ts
interface LogContext {
  userId?: string
  orderId?: string
  sessionId?: string
  endpoint?: string
  duration?: number
}

export const logger = {
  info: (message: string, context?: LogContext) => {
    console.log(JSON.stringify({
      level: 'INFO',
      timestamp: new Date().toISOString(),
      message,
      ...context
    }))
  },

  error: (message: string, error: Error, context?: LogContext) => {
    console.error(JSON.stringify({
      level: 'ERROR',
      timestamp: new Date().toISOString(),
      message,
      error: {
        name: error.name,
        message: error.message,
        stack: error.stack
      },
      ...context
    }))
  },

  warn: (message: string, context?: LogContext) => {
    console.warn(JSON.stringify({
      level: 'WARN',
      timestamp: new Date().toISOString(),
      message,
      ...context
    }))
  },

  debug: (message: string, context?: LogContext) => {
    if (process.env.LOG_QUERIES === 'true') {
      console.debug(JSON.stringify({
        level: 'DEBUG',
        timestamp: new Date().toISOString(),
        message,
        ...context
      }))
    }
  }
}
```

### CloudWatch Log Configuration

**Create Log Group:**
```bash
aws logs create-log-group --log-group-name /vivr/production/app

aws logs put-retention-policy \
  --log-group-name /vivr/production/app \
  --retention-in-days 30
```

**Log Streaming from Application:**
```typescript
// lib/cloudwatch-logs.ts
import { CloudWatchLogsClient, PutLogEventsCommand } from "@aws-sdk/client-cloudwatch-logs"

const cwlogs = new CloudWatchLogsClient({ region: 'us-east-1' })

export async function logToCloudWatch(message: string, level: string) {
  if (process.env.NODE_ENV !== 'production') return

  try {
    await cwlogs.send(new PutLogEventsCommand({
      logGroupName: '/vivr/production/app',
      logStreamName: `${new Date().toISOString().split('T')[0]}`,
      logEvents: [{
        message: JSON.stringify({ timestamp: new Date().toISOString(), level, message }),
        timestamp: Date.now()
      }]
    }))
  } catch (error) {
    // Fallback to console
    console.error('Failed to write to CloudWatch:', error)
  }
}
```

---

## Metrics & Dashboards

### Key Performance Indicators (KPIs)

**Business Metrics:**
```typescript
// lib/business-metrics.ts
export const businessMetrics = {
  ordersCreated: (count: number) => metricsClient.increment('orders.created', count),
  revenueProcessed: (amount: number) => metricsClient.gauge('revenue.processed', amount),
  conversionRate: (rate: number) => metricsClient.gauge('conversion.rate', rate),
  averageOrderValue: (value: number) => metricsClient.gauge('order.average_value', value),
  customerSignups: (count: number) => metricsClient.increment('customers.signups', count),
  cartAbandonment: (count: number) => metricsClient.increment('cart.abandoned', count)
}
```

**Technical Metrics:**
```typescript
export const technicalMetrics = {
  apiResponseTime: (duration: number) => metricsClient.timing('api.response_time', duration),
  databaseQueryTime: (duration: number) => metricsClient.timing('database.query_time', duration),
  cacheHitRate: (rate: number) => metricsClient.gauge('cache.hit_rate', rate),
  errorRate: (count: number) => metricsClient.increment('errors.count', count),
  paymentFailureRate: (rate: number) => metricsClient.gauge('payments.failure_rate', rate),
  pageLoadTime: (duration: number) => metricsClient.timing('page.load_time', duration)
}
```

### Grafana Dashboard

**Dashboard JSON Configuration:**
```json
{
  "dashboard": {
    "title": "VIVR Production Monitoring",
    "panels": [
      {
        "title": "Requests Per Second",
        "targets": [{
          "expr": "rate(http_requests_total[1m])"
        }]
      },
      {
        "title": "Error Rate",
        "targets": [{
          "expr": "rate(errors_total[1m])"
        }]
      },
      {
        "title": "Database Query Time (p95)",
        "targets": [{
          "expr": "histogram_quantile(0.95, database_query_duration_seconds)"
        }]
      },
      {
        "title": "Active Connections",
        "targets": [{
          "expr": "pg_stat_activity_count"
        }]
      }
    ]
  }
}
```

---

## Alerting

### Alert Rules

```yaml
# prometheus-rules.yml
groups:
  - name: vivr_alerts
    interval: 30s
    rules:
      # Critical Alerts
      - alert: ServiceDown
        expr: up{job="vivr"} == 0
        for: 2m
        labels:
          severity: critical
        annotations:
          summary: "VIVR service is down"
          description: "Service has been down for {{ $value | humanizeDuration }}"

      - alert: HighErrorRate
        expr: rate(errors_total[5m]) > 0.05
        for: 2m
        labels:
          severity: critical
        annotations:
          summary: "Error rate exceeds 5%"

      - alert: DatabaseConnectionPoolExhausted
        expr: pg_connections_max - pg_connections_available < 5
        for: 5m
        labels:
          severity: critical

      # Warning Alerts
      - alert: HighResponseTime
        expr: histogram_quantile(0.95, api_response_time_seconds) > 5
        for: 5m
        labels:
          severity: warning

      - alert: HighMemoryUsage
        expr: container_memory_usage_bytes / container_spec_memory_limit_bytes > 0.9
        for: 5m
        labels:
          severity: warning

      - alert: LowDiskSpace
        expr: (node_filesystem_avail_bytes / node_filesystem_size_bytes) < 0.1
        for: 10m
        labels:
          severity: warning

      # Informational Alerts
      - alert: SlowQueryDetected
        expr: slow_queries_total > 0
        for: 5m
        labels:
          severity: info
```

### Notification Channels

**Slack Integration:**
```yaml
# alertmanager.yml
global:
  resolve_timeout: 5m

route:
  receiver: 'slack-critical'
  group_by: ['alertname', 'cluster', 'service']
  routes:
    - match:
        severity: critical
      receiver: slack-critical
      continue: true

receivers:
  - name: slack-critical
    slack_configs:
      - api_url: '${SLACK_WEBHOOK_URL}'
        channel: '#vivr-alerts-critical'
        title: 'Production Alert: {{ .GroupLabels.alertname }}'
        text: '{{ range .Alerts }}{{ .Annotations.description }}{{ end }}'
```

**PagerDuty Integration:**
```yaml
receivers:
  - name: pagerduty-critical
    pagerduty_configs:
      - service_key: '${PAGERDUTY_SERVICE_KEY}'
        description: '{{ .GroupLabels.alertname }}'
        details:
          severity: '{{ .GroupLabels.severity }}'
          alerts: '{{ range .Alerts }}{{ .Annotations.summary }}{{ end }}'
```

---

## Implementation

### Environment Variables

```bash
# Datadog
NEXT_PUBLIC_DATADOG_APP_ID=your_app_id
NEXT_PUBLIC_DATADOG_CLIENT_TOKEN=your_client_token
DD_AGENT_HOST=datadog-agent.example.com
DD_AGENT_PORT=8125

# Sentry
NEXT_PUBLIC_SENTRY_DSN=https://xxx@sentry.io/project-id
SENTRY_DSN=https://xxx@sentry.io/project-id

# CloudWatch
AWS_REGION=us-east-1
AWS_ACCESS_KEY_ID=xxx
AWS_SECRET_ACCESS_KEY=xxx

# Application
APP_VERSION=1.0.0
LOG_QUERIES=false
```

### Deployment Checklist

- [ ] Health check endpoint implemented and tested
- [ ] Application metrics collection enabled
- [ ] Error tracking (Sentry) configured
- [ ] Logging infrastructure set up
- [ ] Dashboards created in Grafana/CloudWatch
- [ ] Alert rules configured and tested
- [ ] Notification channels (Slack, PagerDuty) integrated
- [ ] On-call rotation established
- [ ] Runbooks created for common alerts
- [ ] Team trained on monitoring system

---

**Last Updated:** January 21, 2026
