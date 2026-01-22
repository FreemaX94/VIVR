# Infrastructure Requirements & Architecture

**VIVR E-Commerce Platform**
**Version:** 1.0.0
**Updated:** January 21, 2026

---

## Table of Contents

1. [Architecture Overview](#architecture-overview)
2. [AWS Infrastructure](#aws-infrastructure)
3. [Network Architecture](#network-architecture)
4. [Compute Resources](#compute-resources)
5. [Database Requirements](#database-requirements)
6. [Caching & CDN](#caching--cdn)
7. [Storage](#storage)
8. [Security Groups & Access Control](#security-groups--access-control)
9. [Monitoring & Logging](#monitoring--logging)
10. [Disaster Recovery](#disaster-recovery)
11. [Terraform Configuration](#terraform-configuration)
12. [Cost Estimation](#cost-estimation)

---

## Architecture Overview

### Recommended Cloud Platform: AWS

**Why AWS:**
- Global infrastructure with multiple regions
- Managed services (RDS, ElastiCache, CloudFront)
- Strong security and compliance certifications
- Cost-effective with reservation options
- Mature Terraform support

### High-Level Architecture

```
Internet
   ↓
Route53 (DNS)
   ↓
CloudFront (CDN)
   ↓
AWS WAF
   ↓
Application Load Balancer (ALB)
   ├─→ ECS/EC2 Cluster (Application Servers)
   │    ├─ Container 1: Next.js App
   │    ├─ Container 2: Next.js App
   │    └─ Container 3: Next.js App
   │
   ├─→ RDS PostgreSQL (Primary + Read Replica)
   │
   ├─→ ElastiCache Redis (Cache)
   │
   ├─→ S3 (Static Assets, Backups)
   │
   └─→ CloudWatch (Monitoring)

External Services:
├─ Stripe (Payment Processing)
├─ SendGrid (Email)
├─ Cloudinary (Image Hosting)
└─ Sentry (Error Tracking)
```

---

## AWS Infrastructure

### Region & Availability Zones

```yaml
Primary Region: us-east-1
  - Availability Zone A: us-east-1a
  - Availability Zone B: us-east-1b
  - Availability Zone C: us-east-1c

Backup Region: us-west-2 (for disaster recovery)
  - RDS read replica cross-region
  - S3 cross-region replication
  - CloudFront edge locations globally
```

### VPC Configuration

```yaml
VPC: vivr-vpc
  CIDR: 10.0.0.0/16

Subnets:
  Public Subnets (NAT, ALB):
    - public-1a: 10.0.1.0/24 (us-east-1a)
    - public-1b: 10.0.2.0/24 (us-east-1b)

  Private Subnets (Application):
    - private-1a: 10.0.10.0/24 (us-east-1a)
    - private-1b: 10.0.11.0/24 (us-east-1b)
    - private-1c: 10.0.12.0/24 (us-east-1c)

  Database Subnets:
    - db-1a: 10.0.20.0/24 (us-east-1a)
    - db-1b: 10.0.21.0/24 (us-east-1b)

  Cache Subnets:
    - cache-1a: 10.0.30.0/24 (us-east-1a)
    - cache-1b: 10.0.31.0/24 (us-east-1b)
```

---

## Compute Resources

### Application Layer (ECS on EC2 or Fargate)

**Option 1: ECS with EC2 (Recommended for cost control)**
```yaml
ECS Cluster: vivr-prod
  Launch Type: EC2
  AMI: Amazon Linux 2 ECS optimized

EC2 Instances:
  Instance Type: t3.medium (production), t3.small (staging)
  vCPU: 2
  Memory: 4GB
  Storage: 20GB gp3 EBS (root), 50GB gp3 (Docker/app data)
  Network: Multiple subnets for HA
  Min Instances: 2
  Max Instances: 10
  Desired: 3

Auto Scaling Policy:
  Target CPU: 70%
  Target Memory: 80%
  Scale-out threshold: Exceeded for 2 minutes
  Scale-in threshold: Below for 10 minutes
  Cooldown: 300 seconds
```

**Option 2: ECS Fargate (Serverless - Recommended for simplicity)**
```yaml
ECS Cluster: vivr-prod
  Launch Type: Fargate
  Platform Version: LATEST

Task Definition:
  CPU: 1024 (1 vCPU)
  Memory: 2048 (2GB)
  Containers: 1
    - Container Name: vivr-app
      Image: ghcr.io/your-org/vivr:latest
      Port: 3000
      Essential: true
      LogConfiguration: CloudWatch
      Environment: Production

Service:
  Desired Count: 3
  Deployment Type: ECS (rolling update)
  Min Healthy Percent: 100%
  Max Percent: 200%
  Health Check Grace Period: 60 seconds

Auto Scaling:
  Target: 3-10 tasks
  Target CPU: 70%
  Target Memory: 80%
  Scale-out cooldown: 60 seconds
  Scale-in cooldown: 300 seconds
```

### Load Balancer Configuration

**Application Load Balancer (ALB)**
```yaml
Load Balancer:
  Name: vivr-alb
  Type: Application Load Balancer
  Scheme: Internet-facing
  VPC: vivr-vpc
  Subnets:
    - public-1a
    - public-1b
  Security Groups:
    - Allow inbound: 80 (HTTP), 443 (HTTPS)
    - Allow outbound: All to app security group

Target Group:
  Name: vivr-app-tg
  Protocol: HTTP
  Port: 3000
  VPC: vivr-vpc
  Health Check:
    Path: /api/health
    Protocol: HTTP
    Port: 3000
    Interval: 30 seconds
    Timeout: 5 seconds
    Healthy Threshold: 2
    Unhealthy Threshold: 2

Listener Rules:
  - Rule 1 (HTTPS):
      Protocol: HTTPS
      Port: 443
      Certificate: ACM cert for vivr.example.com
      Actions: Forward to vivr-app-tg
  - Rule 2 (HTTP Redirect):
      Protocol: HTTP
      Port: 80
      Actions: Redirect to HTTPS (301)

Stickiness:
  Enabled: false (stateless app)
  Type: Load balancer generated cookie

Attributes:
  Deregistration delay: 30 seconds
  Preserve client IP: Enabled
  Access logs: Enabled (S3)
```

---

## Database Requirements

### RDS PostgreSQL (Primary Database)

```yaml
DB Instance Identifier: vivr-db
Engine: PostgreSQL
Engine Version: 16.1 (latest stable)
Instance Class: db.t3.small (production minimum)

Scaling Options:
  Small: 2 vCPU, 4GB RAM - for 10-50K users
  Medium: 4 vCPU, 16GB RAM - for 50-200K users
  Large: 8 vCPU, 32GB RAM - for 200K+ users

Storage:
  Type: gp3 (general purpose SSD)
  Allocated: 100GB (minimum)
  Max allocated: 200GB (auto-scale enabled)
  IOPS: 3000 (default)
  Throughput: 125 MB/s (default)

Backup:
  Automated backups: Enabled
  Backup retention: 30 days (production)
  Backup window: 03:00-04:00 UTC
  Backup performance impact: Minimal

Multi-AZ:
  Enabled: Yes (for HA)
  Standby instance: us-east-1b
  Failover time: 1-2 minutes

Replication:
  Read replicas: 1 (same region, us-east-1b)
  Cross-region replica: 1 (us-west-2 for DR)
  Replication lag: <1 second

Security:
  Public accessibility: No
  Database name: vivr
  Port: 5432
  Authentication: IAM database authentication
  Encryption at rest: KMS
  Encryption in transit: SSL/TLS mandatory
  Enhanced monitoring: Enabled
  Log exports: PostgreSQL logs

Performance Insights:
  Enabled: Yes
  Retention period: 31 days

Database Configurations:
  Parameter group: vivr-db-pg
  Option group: default
  Timezone: UTC
  Character set: UTF8
  Collation: en_US.UTF-8

Connection Settings:
  Max connections: 200 (with pgBouncer)
  Connection idle timeout: 300 seconds
  Connection timeout: 20 seconds
  Work memory: 4MB per operation
  Shared buffers: 256MB
  Effective cache size: 1GB
```

### Connection Pooling (PgBouncer)

```yaml
Service: pgbouncer-vivr
Location: Private subnet (separate EC2 instance or managed)

Configuration:
  Pool Mode: transaction (application doesn't need session)
  Max client conn: 1000
  Default pool size: 25
  Min pool size: 10
  Reserve pool size: 5
  Reserve pool timeout: 3 seconds
  Max db connections: 100 (RDS limit)

Features:
  Query logging: Disabled (production)
  Connection aging: 600 seconds
  Idle timeout: 600 seconds
  Server lifetime: 3600 seconds

Monitoring:
  Connection metrics: CloudWatch
  Performance metrics: DataDog
  Alerts: High queue depth, connection errors
```

---

## Caching & CDN

### ElastiCache Redis

```yaml
Cache Cluster: vivr-cache
Engine: Redis
Engine Version: 7.0
Node Type: cache.t3.micro (development), cache.t3.small (production)

Node Configuration:
  Primary: 1 node
  Read replicas: 1 node
  Multi-AZ: Enabled
  Automatic failover: Enabled
  Failover time: <1 minute

Memory:
  Size: 256MB (minimum)
  Eviction policy: allkeys-lru
  Max memory policy: allkeys-lru

Persistence:
  RDB snapshots: Enabled
  Snapshot interval: 15 minutes
  AOF persistence: Disabled (for throughput)

Security:
  VPC: vivr-vpc
  Subnet group: vivr-cache-subnet-group
  Security group: vivr-cache-sg
  Encryption at rest: KMS
  Encryption in transit: TLS enabled
  AUTH token: 32-character random string

Backup:
  Automatic snapshots: Enabled
  Retention: 5 days
  Export to S3: Daily

Performance:
  Multi-threaded I/O: Enabled
  Shards: 1 (single shard)
  Cluster mode: Disabled

Use Cases:
  - Session storage (5-minute TTL)
  - Product cache (30-minute TTL)
  - Cart cache (24-hour TTL)
  - Rate limiting (per-minute counters)
  - Real-time analytics
```

### CloudFront CDN

```yaml
Distribution: vivr-cdn
Default Domain: d123456.cloudfront.net
Alternate Domain Names: vivr.example.com

Origins:
  Origin 1 (Application):
    Domain: vivr-alb.us-east-1.elb.amazonaws.com
    Protocol: HTTPS
    HTTP Port: N/A
    HTTPS Port: 443
    Origin SSL Protocols: TLSv1.2
    Origin Shield: Enabled (us-east-1)
    Custom header: X-Origin-Verify (security)

  Origin 2 (Static Assets):
    Domain: vivr-assets.s3.amazonaws.com
    S3 origin access identity: Enabled
    Origin access identity: origin-access-identity/cloudfront/ABCDEFG

  Origin 3 (Cloudinary Images):
    Domain: res.cloudinary.com
    Origin SSL Protocols: TLSv1.2

Cache Behaviors:
  # API routes - no caching
  Path Pattern: /api/*
    Viewer Protocol Policy: Https-only
    Allowed HTTP Methods: GET, HEAD, OPTIONS, PUT, POST, PATCH, DELETE
    Caching Policy: Managed-CachingDisabled
    Origin Request Policy: AllViewer
    Response Headers Policy: CORS-with-preflight-and-security-headers

  # Static assets - long cache (1 year)
  Path Pattern: /_next/static/*
    Viewer Protocol Policy: Https-only
    Allowed HTTP Methods: GET, HEAD
    Caching Policy: Managed-CachingOptimized
    Origin Request Policy: S3-simple
    Compress: Yes
    Cache TTL: 31536000 (1 year - versioned)

  # Product images - medium cache (30 days)
  Path Pattern: /images/*
    Viewer Protocol Policy: Https-only
    Allowed HTTP Methods: GET, HEAD
    Caching Policy: Managed-CachingOptimized
    Origin: Cloudinary
    Compress: Yes
    Cache TTL: 2592000 (30 days)

  # HTML pages - short cache (5 minutes)
  Path Pattern: Default (/)
    Viewer Protocol Policy: Https-only
    Allowed HTTP Methods: GET, HEAD, OPTIONS, PUT, POST, PATCH, DELETE
    Caching Policy: Managed-CachingDisabled
    Origin Request Policy: AllViewer
    Response Headers Policy: CORS-and-security-headers

Viewer Settings:
  Compress: Yes (gzip, brotli)
  Protocol Policy: Redirect HTTP to HTTPS
  Min TTL: 0
  Default TTL: 86400 (1 day)
  Max TTL: 31536000 (1 year)

Security:
  Web ACL: AWS WAF rules
  SSL Certificate: ACM certificate
  SSL Protocol: TLSv1.2_2023, TLSv1.2_2021
  Origin SSL/TLS: TLSv1.2 minimum
  Field-level encryption: Enabled for sensitive data

Geo-restriction:
  Restriction type: None (global distribution)
  Allowed countries: World (or specific whitelist)

Logging:
  Logging: Enabled
  Log bucket: vivr-logs.s3.amazonaws.com
  Log prefix: cloudfront/
  Include cookies: No
```

---

## Storage

### S3 Buckets

```yaml
Bucket 1: vivr-assets
  Purpose: Static assets, CSS, JavaScript
  Region: us-east-1
  Versioning: Enabled
  Server-side encryption: AES-256
  Block all public access: Yes
  Bucket policy: Allow CloudFront access via OAI
  Lifecycle rules:
    - Delete non-current versions after 30 days

Bucket 2: vivr-backups
  Purpose: Database backups, snapshots
  Region: us-east-1
  Versioning: Enabled
  Encryption: KMS
  Block all public access: Yes
  Bucket policy: Restrict to backup service role
  Lifecycle rules:
    - Transition to GLACIER after 90 days
    - Expire after 1 year
  Cross-region replication: us-west-2

Bucket 3: vivr-logs
  Purpose: CloudFront, ALB, application logs
  Region: us-east-1
  Versioning: Enabled
  Encryption: SSE-S3
  Block all public access: Yes
  Lifecycle rules:
    - Transition to GLACIER after 30 days
    - Expire after 90 days
  Log retention: Queryable for 90 days, archived for 1 year

Bucket 4: vivr-temp
  Purpose: Temporary uploads, processing
  Region: us-east-1
  Versioning: Disabled
  Encryption: SSE-S3
  Block all public access: Yes
  Lifecycle rules:
    - Expire after 7 days (incomplete multipart uploads)
    - Expire after 30 days (all objects)
```

---

## Security Groups & Access Control

### Security Groups

```yaml
Security Group 1: vivr-alb-sg
  Name: Load Balancer Security Group
  VPC: vivr-vpc
  Inbound Rules:
    - HTTP (80): 0.0.0.0/0 (Redirect to HTTPS)
    - HTTPS (443): 0.0.0.0/0
    - ICMP: 0.0.0.0/0 (Ping for monitoring)
  Outbound Rules:
    - All traffic to vivr-app-sg

Security Group 2: vivr-app-sg
  Name: Application Security Group
  VPC: vivr-vpc
  Inbound Rules:
    - TCP 3000: From vivr-alb-sg (ALB)
    - SSH 22: From bastion-sg (Admin only)
  Outbound Rules:
    - TCP 5432: To vivr-db-sg (PostgreSQL)
    - TCP 6379: To vivr-cache-sg (Redis)
    - HTTPS 443: To 0.0.0.0/0 (External APIs)
    - UDP 53: To 0.0.0.0/0 (DNS)

Security Group 3: vivr-db-sg
  Name: Database Security Group
  VPC: vivr-vpc
  Inbound Rules:
    - TCP 5432: From vivr-app-sg (Application)
    - TCP 5432: From vivr-pgbouncer-sg (PgBouncer)
  Outbound Rules:
    - None (default deny)

Security Group 4: vivr-cache-sg
  Name: Cache Security Group
  VPC: vivr-vpc
  Inbound Rules:
    - TCP 6379: From vivr-app-sg (Application)
  Outbound Rules:
    - None (default deny)

Security Group 5: vivr-pgbouncer-sg
  Name: Connection Pool Security Group
  VPC: vivr-vpc
  Inbound Rules:
    - TCP 6432: From vivr-app-sg (Application)
  Outbound Rules:
    - TCP 5432: To vivr-db-sg (Database)
```

### IAM Roles & Policies

```yaml
Role 1: vivr-ecs-task-execution-role
  Trust: ecs-tasks.amazonaws.com
  Policies:
    - AmazonEC2ContainerRegistryReadOnly (pull images)
    - CloudWatchLogsFullAccess (write logs)
    - AmazonSSMReadOnlyAccess (fetch secrets)

Role 2: vivr-ecs-task-role
  Trust: ecs-tasks.amazonaws.com
  Policies:
    - SecretsManagerReadSecret (read from Secrets Manager)
    - S3GetObject (read from S3)
    - SQSSendMessage (publish to SQS if used)
    - SNSPublish (publish to SNS if used)

Role 3: vivr-backup-role
  Trust: rds.amazonaws.com
  Policies:
    - S3PutObject (write backups to S3)
    - KMSGenerateDataKey (encrypt backups)

Role 4: vivr-cloudfront-role
  Trust: cloudfront.amazonaws.com
  Policies:
    - S3GetObject (read from S3)
```

---

## Monitoring & Logging

### CloudWatch Configuration

```yaml
Log Groups:
  - /vivr/production/app (Application logs)
  - /vivr/production/database (RDS logs)
  - /vivr/production/cache (Redis logs)
  - /vivr/production/alb (ALB access logs)
  - /vivr/production/cloudfront (CloudFront logs)

Retention:
  - Application: 30 days
  - Database: 7 days
  - Cache: 7 days
  - ALB: 30 days
  - CloudFront: 30 days

Alarms:
  CPU Utilization:
    - Threshold: > 80%
    - Period: 5 minutes
    - Action: Scale out

  Memory Utilization:
    - Threshold: > 85%
    - Period: 5 minutes
    - Action: Scale out

  Error Rate:
    - Threshold: > 1% (5xx errors)
    - Period: 2 minutes
    - Action: Alert team

  Database Connections:
    - Threshold: > 80% of max
    - Period: 5 minutes
    - Action: Alert DevOps

  Database Storage:
    - Threshold: > 85% used
    - Period: 60 minutes
    - Action: Alert to increase size

  Health Check Failures:
    - Threshold: > 50% unhealthy targets
    - Period: 2 minutes
    - Action: Immediate alert

  Request Count:
    - Metric: Requests per minute
    - Action: Track for capacity planning
```

---

## Disaster Recovery

### RTO & RPO

```
RTO (Recovery Time Objective): 4 hours
RPO (Recovery Point Objective): 1 hour

Backup Strategy:
- Automated daily snapshots (30-day retention)
- Manual backups before deployments (90-day retention)
- Cross-region replication (for regional failure)
- Archive backups for compliance (1-year retention)
```

### Failover Architecture

```yaml
Primary Region: us-east-1
  - RDS Primary
  - ECS Cluster
  - Redis Primary
  - ALB

Failover Region: us-west-2
  - RDS Read Replica (can be promoted)
  - Standby ECS Cluster (can be activated)
  - Standby Redis
  - Standby ALB

Route53 Health Check:
  - Monitors primary ALB health
  - Automatic failover to Route53 weighted routing
  - TTL: 60 seconds (fast failover)
```

---

## Terraform Configuration

### terraform/main.tf

```hcl
terraform {
  required_version = ">= 1.0"

  required_providers {
    aws = {
      source  = "hashicorp/aws"
      version = "~> 5.0"
    }
  }

  backend "s3" {
    bucket         = "vivr-terraform-state"
    key            = "production/terraform.tfstate"
    region         = "us-east-1"
    encrypt        = true
    dynamodb_table = "terraform-lock"
  }
}

provider "aws" {
  region = "us-east-1"

  default_tags {
    tags = {
      Environment = "production"
      Project     = "vivr"
      ManagedBy   = "terraform"
      CreatedAt   = timestamp()
    }
  }
}

# Include modules
module "vpc" {
  source = "./modules/vpc"
  # Configuration
}

module "security_groups" {
  source = "./modules/security-groups"
  vpc_id = module.vpc.vpc_id
  # Configuration
}

module "rds" {
  source = "./modules/rds"
  # Configuration
}

module "elasticache" {
  source = "./modules/elasticache"
  # Configuration
}

module "ecs" {
  source = "./modules/ecs"
  # Configuration
}

module "alb" {
  source = "./modules/alb"
  # Configuration
}

module "cloudfront" {
  source = "./modules/cloudfront"
  # Configuration
}

module "monitoring" {
  source = "./modules/monitoring"
  # Configuration
}
```

---

## Cost Estimation

### Monthly Cost Breakdown

| Service | Size | Quantity | Unit Cost | Monthly |
|---------|------|----------|-----------|---------|
| **Compute** | | | | |
| ECS (Fargate) | 1 vCPU, 2GB | 3 tasks | $32.74 | $98.22 |
| ALB | Standard | 1 | $16.20 | $16.20 |
| **Database** | | | | |
| RDS PostgreSQL | db.t3.small | 1 | $0.035/hr | $25.92 |
| RDS Multi-AZ | db.t3.small | 1 standby | $0.035/hr | $25.92 |
| RDS Storage | 100GB gp3 | 100 | $0.1/GB | $10.00 |
| RDS Backups | 50GB retained | - | $0.02/GB | $1.00 |
| **Caching** | | | | |
| ElastiCache | cache.t3.small | 2 nodes | $0.017/hr | $25.08 |
| **Storage** | | | | |
| S3 Standard | 50GB | - | $0.023/GB | $1.15 |
| S3 Glacier | 100GB archived | - | $0.004/GB | $0.40 |
| **Content Delivery** | | | | |
| CloudFront | 100GB/month | - | $0.085/GB | $8.50 |
| **Monitoring** | | | | |
| CloudWatch | Standard | - | - | $10.00 |
| DataDog APM | Host | - | - | $100.00 |
| **Networking** | | | | |
| NAT Gateway | Standard | 1 | $32.00/month | $32.00 |
| Data Transfer | 10GB out | - | $0.02/GB | $0.20 |
| **Other** | | | | |
| Route53 | Hosted zones | 1 | $0.50/month | $0.50 |
| Secrets Manager | Secret | 5 | $0.40/month | $2.00 |
| KMS | Key | 1 | $1.00/month | $1.00 |
| **TOTAL MONTHLY** | | | | **$358.09** |

### Cost Optimization Tips

1. **Reserved Instances** - Save 30% on EC2/RDS
2. **Spot Instances** - Use for non-critical workloads
3. **S3 Lifecycle** - Archive to Glacier after 30 days
4. **CloudFront** - Reduce origin requests with caching
5. **Right-sizing** - Monitor and adjust instance sizes
6. **Shared responsibility** - Use managed services

---

## Deployment Instructions

### Prerequisites

```bash
# Install Terraform
brew install terraform

# Install AWS CLI
brew install awscli

# Configure AWS credentials
aws configure

# Set environment
export AWS_REGION=us-east-1
```

### Deploy Infrastructure

```bash
# Clone Terraform code
git clone repo/terraform

# Initialize Terraform
terraform init

# Plan infrastructure
terraform plan -out=tfplan

# Review plan
terraform show tfplan

# Apply plan
terraform apply tfplan

# Get outputs
terraform output
```

---

**Last Updated:** January 21, 2026
**Review Schedule:** Quarterly
**Next Review:** April 21, 2026
