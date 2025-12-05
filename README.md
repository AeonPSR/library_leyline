# Library Leyline

A full-stack library management application with comprehensive CI/CD pipelines.

## Tech Stack

### Frontend & Backend
- **Next.js 16** - React framework with App Router
- **React 19** - UI library
- **Tailwind CSS 4** - Styling

### Database
- **SQLite** - Local database via better-sqlite3
- **better-sqlite3** - Synchronous SQLite3 bindings

### Testing
- **Vitest** - Unit and API testing (20 tests)
- **Cypress** - E2E testing (6 tests)

### DevOps & CI/CD
- **GitHub Actions** - Automated CI/CD pipelines
- **Docker** - Containerization for Cloud Run
- **Ansible** - Infrastructure as Code
- **PM2** - Node.js process manager
- **Nginx** - Reverse proxy

### Architecture
- **API Routes** - Next.js API routes (`/app/api/*`)
- **Models** - Data layer in `/lib/models/`
- **Database** - SQLite connection in `/lib/database.js`

## Getting Started

### Prerequisites
- Node.js 18+ 
- npm

### Installation

```bash
npm install
```

### Development

Run the development server:

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) to view the application.

### Testing

```bash
# Run all tests
npm test

# Run unit tests
npm run test:unit

# Run API tests
npm run test:api

# Run E2E tests
npm run test:e2e

# Run E2E in UI mode
npm run cypress:open
## Project Structure

```
├── app/
│   ├── api/              # API routes
│   │   ├── articles/     # Article CRUD operations
│   │   ├── postits/      # Post-it CRUD operations
│   │   ├── tags/         # Tag management
│   │   └── health/       # Health check endpoint
│   └── page.js           # Main page
├── components/           # React components
├── lib/
│   ├── database.js       # SQLite connection with env detection
│   └── models/           # Data models
│       ├── Article.js
│       ├── PostIt.js
│       └── Tag.js
├── tests/
│   ├── unit/             # Unit tests (Vitest)
│   ├── api/              # API integration tests (Vitest)
│   └── e2e/              # End-to-end tests (Cypress)
├── .github/
│   └── workflows/        # CI/CD pipelines
│       ├── ci.yml        # Continuous Integration
│       ├── cd-cloudrun.yml  # Deploy to Google Cloud Run
│       └── cd-ansible.yml   # Deploy to production server
├── ansible/
│   ├── playbooks/        # Deployment playbooks
│   ├── roles/            # Ansible roles (nodejs, app, pm2, nginx)
│   ├── group_vars/       # Environment variables
│   └── inventory.ini     # Server inventory
├── docker/
│   └── Dockerfile        # Multi-stage Docker build
└── docs/                 # Documentation
## Features

- 📝 Article management with versioning
- 📌 Post-it notes linked to articles
- 🏷️ Tag system for organization
- 🔍 Search and filtering
- ✅ Comprehensive test suite (26 tests)
- 🚀 Multiple CI/CD pipelines
## Quick Start

### Local Development

1. **Clone and install:**
   ```bash
   git clone <repository-url>
   cd library_website
   npm install
   ```

2. **Run development server:**
   ```bash
   npm run dev
   ```
   Open [http://localhost:3000](http://localhost:3000)

3. **Run tests:**
   ```bash
   npm test           # All tests
   npm run test:e2e   # E2E tests
   ```

### Production Deployment

#### Via Ansible (Recommended)

1. Set up GitHub Secrets:
   - `SSH_PRIVATE_KEY`
   - `SERVER_IP`
   - `SERVER_USER`

2. Push to main branch:
   ```bash
   git push origin main
   ```

3. Application automatically deploys to production server

See [CD_ANSIBLE_SETUP.md](docs/CD_ANSIBLE_SETUP.md) for detailed setup.

#### Via Cloud Run

1. Set up GitHub Secrets:
   - `GCP_PROJECT_ID`
   - `GCP_SA_KEY`

2. Push to trigger deployment

See [CD_SETUP.md](docs/CD_SETUP.md) for detailed setup.
- ✅ Matrix builds (Node 20/22, Ubuntu/Windows)

**Status:** All 26 tests passing ✅

### Continuous Deployment (CD)

#### Option 1: Google Cloud Run
- Container-based deployment
- Auto-scaling
- HTTPS by default
- See [CD_SETUP.md](docs/CD_SETUP.md) for setup

#### Option 2: Production Server (Ansible)
- Deploy to Ubuntu server
- PM2 cluster mode (2 instances)
- Nginx reverse proxy
- Automatic on push to `main`
- See [CD_ANSIBLE_SETUP.md](docs/CD_ANSIBLE_SETUP.md) for setup

## Documentation

- [Project Structure](docs/PROJECT_STRUCTURE.md) - Detailed folder organization
- [Cloud Run Deployment](docs/CD_SETUP.md) - GCP deployment guide
- [Ansible Deployment](docs/CD_ANSIBLE_SETUP.md) - Production server setup
│   └── page.js        # Main page
├── components/        # React components
├── lib/
│   ├── database.js    # SQLite connection
│   └── models/        # Data models
│       ├── Article.js
│       ├── PostIt.js
│       └── Tag.js
└── .github/
    └── workflows/     # CI/CD pipelines
```

## Features

- 📝 Article management with versioning
- 📌 Post-it notes linked to articles
- 🏷️ Tag system for organization
- 🔍 Search and filtering
- 🚀 CI/CD with GitHub Actions

## Learn More

To learn more about Next.js, take a look at the following resources:

- [Next.js Documentation](https://nextjs.org/docs) - learn about Next.js features and API.
- [Learn Next.js](https://nextjs.org/learn) - an interactive Next.js tutorial.

You can check out [the Next.js GitHub repository](https://github.com/vercel/next.js) - your feedback and contributions are welcome!

## Deploy on Vercel

The easiest way to deploy your Next.js app is to use the [Vercel Platform](https://vercel.com/new?utm_medium=default-template&filter=next.js&utm_source=create-next-app&utm_campaign=create-next-app-readme) from the creators of Next.js.

Check out our [Next.js deployment documentation](https://nextjs.org/docs/app/building-your-application/deploying) for more details.
