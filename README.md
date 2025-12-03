# Library Leyline

A full-stack library management application for organizing articles, post-its, and tags.

## Tech Stack

### Frontend & Backend
- **Next.js 16** - React framework with App Router
- **React 19** - UI library
- **Tailwind CSS 4** - Styling

### Database
- **SQLite** - Local database via better-sqlite3
- **better-sqlite3** - Synchronous SQLite3 bindings

### Development Tools
- **ESLint** - Code linting
- **Vitest** - Unit and API testing
- **GitHub Actions** - CI/CD pipeline

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

# Run API tests
npm run test:api
```

### Building

```bash
npm run build
npm start
```

## Project Structure

```
├── app/
│   ├── api/           # API routes
│   │   ├── articles/
│   │   ├── postits/
│   │   └── tags/
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
