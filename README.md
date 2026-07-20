# LexMind AI

Enterprise Development Kit (EDK) - Version 1.0

## Overview

LexMind AI is a comprehensive SaaS platform for law firms, independent lawyers, and corporate legal departments. It integrates case management, client management, document management, AI-powered document generation, legal research, finance management, and team management into a single platform.

## Tech Stack

### Frontend
- Next.js 15
- React 19
- TypeScript
- Tailwind CSS
- shadcn/ui
- React Hook Form
- Zod
- TanStack Query
- Zustand
- Recharts

### Backend
- NestJS
- TypeScript
- Prisma ORM
- PostgreSQL
- BullMQ
- Redis
- Swagger

### AI
- OpenAI Responses API
- Embeddings
- pgvector
- RAG

### Infrastructure
- Docker
- Docker Compose
- GitHub Actions
- Nginx

## Project Structure

```
lexmind-ai/
├── apps/
│   ├── frontend/          # Next.js 15 frontend application
│   └── backend/           # NestJS backend application
├── packages/
│   ├── ui/                # Shared UI components
│   ├── types/             # Shared TypeScript types
│   └── config/            # Shared configuration
├── docker-compose.yml
├── package.json
└── turbo.json
```

## Getting Started

### Prerequisites

- Node.js >= 18.0.0
- npm >= 9.0.0
- Docker and Docker Compose

### Installation

1. Clone the repository
2. Install dependencies:
   ```bash
   npm install
   ```
3. Setup environment files:
   ```bash
   # Backend environment
   cp apps/backend/.env.example apps/backend/.env.development
   cp apps/backend/.env.development apps/backend/.env
   
   # Frontend environment
   cp apps/frontend/.env.example apps/frontend/.env.development
   ```
4. Start the infrastructure services:
   ```bash
   docker-compose up -d postgres redis minio
   ```
5. Run database migrations:
   ```bash
   cd apps/backend
   npm run prisma:generate
   npm run prisma:migrate
   cd ../..
   ```
6. Start the development environment:
   ```bash
   npm run dev
   ```

### Development

- Frontend: http://localhost:3000
- Backend API: http://localhost:3001
- API Documentation: http://localhost:3001/api/docs
- PostgreSQL: localhost:5432
- Redis: localhost:6379
- MinIO: http://localhost:9000

### Environment Variables

#### Backend (.env.development)
```
NODE_ENV=development
PORT=3001
DATABASE_URL=postgresql://postgres:postgres@localhost:5432/lexmind_ai?schema=public
REDIS_HOST=localhost
REDIS_PORT=6379
JWT_SECRET=dev-secret-key-change-in-production
JWT_REFRESH_SECRET=dev-refresh-secret-key-change-in-production
OPENAI_API_KEY=your-openai-api-key
```

#### Frontend (.env.development)
```
NEXT_PUBLIC_API_URL=http://localhost:3001
NEXT_PUBLIC_APP_NAME=LexMind AI
```

## Modules (Version 1.0)

1. Authentication
2. Dashboard
3. Client Management
4. Case Management
5. Document Management
6. AI Workspace
7. Document Composer
8. Legal Research Center
9. Calendar & Task Center
10. Finance Center
11. Client Portal
12. Team Management
13. Executive Dashboard

## Documentation

Detailed documentation is available in the following files:

- [Project Manifest](docs/00_PROJECT_MANIFEST.md)
- [Product Requirements](docs/01_PRODUCT_REQUIREMENTS.md)
- [Business Requirements](docs/02_BUSINESS_REQUIREMENTS.md)
- [Technical Architecture](docs/03_TECHNICAL_ARCHITECTURE.md)
- [Database Design](docs/04_DATABASE_DESIGN.md)
- [API Specification](docs/05_API_SPECIFICATION.md)
- [UI/UX Design System](docs/06_UI_UX_DESIGN_SYSTEM.md)
- [Frontend Guide](docs/07_FRONTEND_GUIDE.md)
- [Backend Guide](docs/08_BACKEND_GUIDE.md)
- [AI Services](docs/09_AI_SERVICES.md)

## License

Proprietary - LexMind AI Team

## Version

1.0.0
