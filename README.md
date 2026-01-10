# Teachy Assignment Platform

A production-ready education platform that allows teachers to create and share exercise lists, and students to authenticate, answer them, and view results.

## Tech Stack

- **Frontend**: Next.js 14 (App Router), React, TypeScript, Zustand, Tailwind CSS, React Hook Form, Zod, Framer Motion
- **Backend**: Next.js API Routes, Prisma, PostgreSQL
- **Authentication**: Firebase Authentication
- **Monorepo**: Turborepo with pnpm

## Getting Started

### Prerequisites

- Node.js >= 18.0.0
- pnpm >= 8.0.0
- PostgreSQL (local or remote)

### Installation

1. Clone the repository
2. Install dependencies:
   ```bash
   pnpm install
   ```
3. Copy `.env.example` to `.env` and fill in your environment variables
4. Run the development server:
   ```bash
   pnpm dev
   ```

The app will be available at [http://localhost:3000](http://localhost:3000)

## Project Structure

```
teachy-assignment-platform/
├── apps/
│   └── web/              # Next.js application
├── packages/
│   ├── db/               # Prisma schema and client
│   ├── firebase/         # Firebase client and admin setup
│   ├── ui/               # Shared UI components
│   └── config/           # Shared configs (TS, ESLint, Tailwind)
```

## Available Scripts

- `pnpm dev` - Start development server
- `pnpm build` - Build for production
- `pnpm lint` - Run ESLint
- `pnpm format` - Format code with Prettier
- `pnpm type-check` - Run TypeScript type checking

## License

Private
