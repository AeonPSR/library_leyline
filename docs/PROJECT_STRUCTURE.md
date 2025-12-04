# Project Structure

This document explains the organization of the Library Website project.

## Directory Structure

```
library_website/
├── app/                    # Next.js App Router pages and API routes
│   ├── api/               # API endpoints (articles, health check)
│   ├── articles/          # Article pages
│   └── page.js            # Homepage
│
├── components/            # React components
│
├── lib/                   # Shared utilities and models
│   ├── database.js        # SQLite database connection
│   └── models/           # Data models (Article, etc.)
│
├── public/                # Static assets
│
├── tests/                 # All test files
│   ├── unit/             # Unit tests (Vitest/Jest)
│   ├── api/              # API integration tests (Vitest)
│   └── e2e/              # End-to-end tests (Cypress)
│
├── .github/
│   └── workflows/        # CI/CD pipelines
│       ├── ci.yml                # Continuous Integration pipeline
│       ├── cd-cloudrun.yml       # CD: GitHub Actions + Cloud Run
│       └── cd-ansible.yml        # CD: Ansible Local deployment
│
├── ansible/              # Ansible playbooks and configuration
│   ├── playbooks/        # Deployment playbooks
│   ├── roles/            # Ansible roles
│   └── group_vars/       # Variables
│
├── docker/               # Docker configuration
│   ├── Dockerfile        # Multi-stage production build
│   └── .dockerignore     # Files to exclude from Docker build
│
├── docs/                 # Documentation
│   ├── PROJECT_STRUCTURE.md  # This file
│   ├── CD_SETUP.md          # Deployment setup guide
│   └── FINAL_REPORT.md      # Final project report
│
├── package.json          # Node.js dependencies and scripts
├── next.config.mjs       # Next.js configuration
├── vitest.config.js      # Vitest test configuration
└── README.md             # Project overview

```

## Purpose of Each Directory

### Application Code
- **`app/`**: Next.js application using App Router
- **`components/`**: Reusable React components
- **`lib/`**: Business logic, database models, utilities
- **`public/`**: Static files (images, fonts, etc.)

### Testing
- **`tests/unit/`**: Unit tests for models and utilities
- **`tests/api/`**: API endpoint integration tests
- **`tests/e2e/`**: Cypress end-to-end browser tests

### CI/CD
- **`.github/workflows/ci.yml`**: Runs on every push/PR
  - Linting (ESLint)
  - Unit tests
  - API tests
  - E2E tests (Cypress)
  - Build verification
  - Artifact uploads

- **`.github/workflows/cd-cloudrun.yml`**: GitHub Actions only deployment
  - Builds Docker image
  - Pushes to Google Container Registry
  - Deploys to Cloud Run
  - Health checks
  - Production smoke tests

- **`.github/workflows/cd-ansible.yml`**: Ansible local deployment
  - Uses Ansible playbooks
  - Deploys to local/VM server
  - PM2 process management

### Deployment
- **`ansible/`**: Infrastructure as Code for server provisioning and deployment
- **`docker/`**: Container configuration for Cloud Run and local testing

### Documentation
- **`docs/`**: All project documentation including setup guides and reports

## Key Files

- **`package.json`**: Dependencies and npm scripts
- **`next.config.mjs`**: Next.js build configuration (standalone output for Docker)
- **`vitest.config.js`**: Test runner configuration
- **`leylines.db`**: SQLite database (development)
- **`test.db`**: SQLite database (testing)

## Development vs Production

### Development
- Database: `leylines.db` in project root
- Server: `npm run dev` (hot reload)
- Port: 3000

### Production
- Database: `/app/data/leylines.db` (Docker) or configured path
- Server: `npm start` (optimized build)
- Port: 3000 (configurable via ENV)

## CI/CD Flow

```
Push to GitHub
    ↓
CI Pipeline (ci.yml)
    ├── Lint code
    ├── Run unit tests
    ├── Run API tests
    ├── Run E2E tests
    └── Build application
    ↓
[On master branch]
    ↓
CD Pipelines (parallel)
    ├── cd-cloudrun.yml → Cloud Run
    └── cd-ansible.yml → Local/VM Server
```

## Quick Start

### Development
```bash
npm install
npm run dev
```

### Testing
```bash
npm test              # Unit tests
npm run test:api      # API tests
npm run test:all      # All tests
```

### Docker
```bash
cd docker
docker build -t library-website .
docker run -p 3000:3000 library-website
```

### Deployment
See `docs/CD_SETUP.md` for deployment configuration.
