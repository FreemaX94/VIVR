# VIVR E-Commerce n8n Automation Workflows

This directory contains all n8n workflow specifications for automating the VIVR e-commerce platform operations.

## Overview

The VIVR automation system consists of 5 main categories:

1. **Order Processing** - Automated order lifecycle management
2. **Customer Communication** - Email and notification workflows
3. **Business Operations** - Reports, alerts, and monitoring
4. **Integration Workflows** - Third-party service integrations
5. **Administrative** - System maintenance and backups

## Architecture

```
                    +------------------+
                    |   VIVR Next.js   |
                    |   Application    |
                    +--------+---------+
                             |
              +--------------+--------------+
              |                             |
    +---------v---------+         +---------v---------+
    |   API Endpoints   |         |   Stripe Webhooks |
    |   /api/orders     |         |   /api/stripe/    |
    |   /api/products   |         |   webhook         |
    +--------+----------+         +---------+---------+
             |                              |
             +-------------+----------------+
                           |
                  +--------v--------+
                  |    n8n Server   |
                  |  (Automation)   |
                  +--------+--------+
                           |
         +-----------------+------------------+
         |        |        |        |        |
    +----v---+ +--v--+ +---v---+ +--v--+ +---v---+
    | Email  | | CRM | | Slack | | DB  | |Analytics|
    +--------+ +-----+ +-------+ +-----+ +---------+
```

## Environment Variables Required

```env
# n8n Configuration
N8N_HOST=https://n8n.vivr.fr
N8N_API_KEY=your-n8n-api-key

# VIVR API
VIVR_API_URL=https://api.vivr.fr
VIVR_API_KEY=your-vivr-api-key
VIVR_WEBHOOK_SECRET=your-webhook-secret

# Email (SMTP or SendGrid)
SMTP_HOST=smtp.sendgrid.net
SMTP_PORT=587
SMTP_USER=apikey
SMTP_PASS=your-sendgrid-api-key
EMAIL_FROM=noreply@vivr.fr

# Stripe
STRIPE_WEBHOOK_SECRET=whsec_xxx
STRIPE_SECRET_KEY=sk_xxx

# Slack (optional)
SLACK_WEBHOOK_URL=https://hooks.slack.com/services/xxx
SLACK_BOT_TOKEN=xoxb-xxx

# Database
DATABASE_URL=postgresql://user:pass@host:5432/vivr

# Analytics
GA_MEASUREMENT_ID=G-XXXXXXX
```

## Workflow Files

| Category | Workflow | File |
|----------|----------|------|
| Order Processing | Order Confirmation | `01-order-processing/order-confirmation.json` |
| Order Processing | Inventory Update | `01-order-processing/inventory-update.json` |
| Order Processing | Shipping Notification | `01-order-processing/shipping-notification.json` |
| Order Processing | Order Status Webhook | `01-order-processing/order-status-webhook.json` |
| Customer Communication | Welcome Email | `02-customer-communication/welcome-email.json` |
| Customer Communication | Abandoned Cart | `02-customer-communication/abandoned-cart.json` |
| Customer Communication | Review Request | `02-customer-communication/review-request.json` |
| Customer Communication | Newsletter | `02-customer-communication/newsletter.json` |
| Business Operations | Daily Sales Report | `03-business-operations/daily-sales-report.json` |
| Business Operations | Low Stock Alert | `03-business-operations/low-stock-alert.json` |
| Business Operations | New Order Notification | `03-business-operations/new-order-notification.json` |
| Business Operations | Payment Confirmation | `03-business-operations/payment-confirmation.json` |
| Integration | Stripe Webhook | `04-integrations/stripe-webhook.json` |
| Integration | CRM Sync | `04-integrations/crm-sync.json` |
| Integration | Analytics Events | `04-integrations/analytics-events.json` |
| Integration | Social Media | `04-integrations/social-media.json` |
| Administrative | Database Backup | `05-administrative/database-backup.json` |
| Administrative | Log Aggregation | `05-administrative/log-aggregation.json` |
| Administrative | Error Notification | `05-administrative/error-notification.json` |

## Quick Start

1. Import workflows into your n8n instance
2. Configure credentials for each service
3. Update webhook URLs in VIVR application
4. Test each workflow individually
5. Enable workflows in production

## Webhook Endpoints

After deploying workflows, configure these webhooks in VIVR:

| Event | n8n Webhook URL |
|-------|-----------------|
| Order Created | `{N8N_HOST}/webhook/order-created` |
| Order Updated | `{N8N_HOST}/webhook/order-updated` |
| User Registered | `{N8N_HOST}/webhook/user-registered` |
| Cart Abandoned | `{N8N_HOST}/webhook/cart-abandoned` |
| Payment Success | `{N8N_HOST}/webhook/payment-success` |
| Stripe Events | `{N8N_HOST}/webhook/stripe` |
