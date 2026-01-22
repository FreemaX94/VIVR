# Python Tooling for VIVR E-commerce Platform

This directory contains Python-based tools that complement the TypeScript/Next.js stack.
Python excels at data analysis, machine learning, automation, and DevOps tasks that would
be more complex to implement in TypeScript.

## Directory Structure

```
python-tooling/
├── analytics/          # Data analysis and reporting
├── ml/                 # Machine learning models
├── automation/         # Scripts for data processing
├── testing/            # Load testing and security scanning
├── devops/             # Deployment and monitoring
├── shared/             # Shared utilities and database access
└── requirements.txt    # Python dependencies
```

## Prerequisites

- Python 3.11+
- PostgreSQL access (same database as VIVR)
- Virtual environment recommended

## Installation

```bash
cd python-tooling
python -m venv venv
source venv/bin/activate  # On Windows: venv\Scripts\activate
pip install -r requirements.txt
```

## Configuration

Create a `.env` file in the python-tooling directory:

```env
DATABASE_URL=postgresql://user:password@localhost:5432/vivr
STRIPE_API_KEY=sk_...
OPENAI_API_KEY=sk-...  # For ML features
REDIS_URL=redis://localhost:6379
```
