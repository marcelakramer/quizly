# Quizly

Quizly is an education platform that helps teachers create, share and assign exercise lists, while allowing students to complete exercises and review their results.

## 👤 Getting Started

To explore the teacher and student flows, you must register an account and choose your specific role during sign-up. Once you enter the app, you'll have access to role-specific features:

- Teachers can create exercise lists, add questions, and view student submissions.
- Students can access quizzes using a specific code, complete assignments and review their results.

The UI will guide you through the features available for your chosen role.

## 🏗️ Approach: Why Monorepo?

This repository is organized as a **monorepo** using **Turborepo** and **pnpm workspaces**. The primary app lives under `apps/web` and shared code/config lives under `packages`.

### Benefits of the monorepo approach:

- **Code sharing**: Easily share TypeScript types and configuration between packages and the web app.
- **Faster development**: Turborepo's intelligent caching speeds up builds and tests by only rebuilding what's changed.
- **Simplified dependencies**: One `pnpm install` at the root manages all packages.
- **Consistency**: Centralized tooling and configs ensure the entire codebase follows the same standards.
- **Practical for tight deadlines**: Given the project timeline, a monorepo allowed rapid iteration without the overhead of managing multiple repositories, complicated inter-repo linking, or publishing internal packages.

## 🛠️ Technologies: Why were they chosen?

### Frontend

- **Next.js (App Router)**: Chosen because it fits the needs of a small full-stack web application, where both server-side logic and client-side interactivity are required. The App Router allows seamless integration of pages, server-side API routes, and authentication without a separate backend framework.
- **TypeScript**: Adopted to catch errors during development rather than in production, improve code maintainability through better documentation via types, clear interfaces and contracts.

### Styling

- **Tailwind CSS**: Chosen for rapid prototyping and consistent design without writing custom CSS files. The utility-first approach speeds up development significantly—especially important given the tight deadline—and ensures design consistency across the application without maintaining separate stylesheets.

### Backend & Data

- **Next.js API Routes**: Chosen to keep the stack unified (no separate backend server needed), simplify deployment (single application to deploy), and enable easy sharing of types and utilities between frontend and backend code.
- **Prisma**: Selected for its excellent TypeScript integration that provides full type safety from database to UI, intuitive migration workflow, and clear schema definition that serves as documentation.
- **PostgreSQL**: Chosen for its robustness in production environments, strong ACID compliance for data integrity, and powerful features (JSON support, full-text search, complex queries) that provide flexibility for future enhancements without changing databases.

### Authentication

- **Firebase Authentication**: Selected to avoid building and maintaining custom authentication infrastructure, which would be time-consuming and security-critical. Using both client and admin SDKs ensures secure token verification on the server while maintaining smooth user experience on the client.

### Monorepo & Tooling

- **Turborepo**: Chosen to speed up builds through intelligent caching and parallel task execution. Critical for maintaining fast iteration cycles during development, especially with the tight deadline. Automatically understands package dependencies and builds only what's necessary.
- **pnpm**: Selected for its significantly faster installation times compared to npm/yarn, efficient disk usage (important for CI/CD environments), and strict dependency resolution that prevents bugs from phantom dependencies.

## 🚀 Running Instructions

### Live Demo

You can try the live demo [here](https://quizly-platform.vercel.app/)!

### Quick start

1. **Clone the repository**

```bash
   git clone git@github.com:marcelakramer/quizly.git
   cd quizly
```

2. **Install dependencies**

```bash
   pnpm install
```

3. **Configure environment variables**

```bash
   cp apps/web/.env.example apps/web/.env
   cp packages/db/.env.example packages/db/.env
   # Edit apps/web/.env and packages/db/.env files with your configuration.
   #
   # Note: You'll need valid credentials for:
   # - Database connection string (PostgreSQL)
   # - Firebase config (API keys, project ID, auth domain, etc.)
   #
   # If you don't have these credentials, please contact the project author
   # to request access or set up your own Firebase project and database instance.
```

4. **Start the development server**

```bash
   pnpm dev --filter web
```

The web app will be available at http://localhost:3000 by default.

## 📁 Project layout (high level)

```
quizly/
├── apps/
│   └── web/              # Next.js application (main app)
│       ├── app/          # App Router pages and API routes
│       ├── components/   # React components
│       ├── lib/          # Utilities and helpers
│       ├── hooks/        # Custom hooks
│       └── public/       # Static assets
├── packages/
│   ├── db/               # Prisma schema, migrations, and client
│   ├── firebase/         # Firebase client and admin SDK setup
│   └── config/           # Shared configs (TypeScript, ESLint, Tailwind)
├── turbo.json            # Turborepo pipeline configuration
└── pnpm-workspace.yaml   # pnpm workspace definition
```

## 🔮 Future enhancements: How would I improve this?

- Teacher functionality for manually reviewing and grading open-ended responses
- Additional question types (e.g., matching, fill-in-the-blank, file uploads)
- Class/Group creation
- Direct assignment distribution to students or classes/groups
