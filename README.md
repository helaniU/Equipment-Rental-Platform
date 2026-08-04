# Equipment Rental Platform

An enterprise-grade equipment rental system for managing inventory, reservations, invoicing, payments, notifications, and warehouse workflows.

## Tech Stack

- Frontend: Next.js, React, TypeScript, Tailwind CSS, Lucide Icons, Recharts
- Backend: NestJS, TypeScript, TypeORM, PostgreSQL, Redis, BullMQ
- Mobile: Flutter
- Authentication: JWT with role-based access control
- File storage: AWS S3 or Cloudflare R2, with local fallback storage
- Infrastructure: Docker and Docker Compose
- Tooling: ESLint, Prettier, Swagger/OpenAPI

## Repository Structure

- `backend/` - NestJS REST API
- `frontend/` - Next.js dashboard application
- `mobile/` - Flutter customer and staff application
- `docs/` - ER diagrams, API documentation, and deployment guides
- `README.md` - Project overview and setup guide

## Key Features

- Equipment inventory management
- Customer reservation workflow
- Payment processing and refund handling
- Admin, staff, customer, and warehouse role support
- Upload handling for equipment images and documents
- Dashboard analytics and operational reporting
- Queue-based notification processing with Redis/BullMQ

## Prerequisites

- Node.js 18 or newer
- npm 9 or newer
- PostgreSQL 14 or newer
- Redis 6 or newer
- Optional: AWS S3 or Cloudflare R2 credentials

## Environment Variables

Create a `.env` file in `backend/` with values similar to the following:

```env
PORT=5000
DB_HOST=localhost
DB_PORT=5432
DB_USERNAME=postgres
DB_PASSWORD=postgres
DB_DATABASE=equipment_rental
DB_SSL=false

JWT_SECRET=change_me
JWT_REFRESH_SECRET=change_me_too

REDIS_HOST=127.0.0.1
REDIS_PORT=6379

AWS_REGION=us-east-1
AWS_ACCESS_KEY_ID=
AWS_SECRET_ACCESS_KEY=
AWS_BUCKET_NAME=
AWS_ENDPOINT=
```

Create a `.env.local` file in `frontend/`:

```env
NEXT_PUBLIC_API_URL=http://localhost:5000
```

## Local Development Setup

### 1. Install dependencies

From the repository root:

```bash
cd backend
npm install

cd ../frontend
npm install
```

### 2. Prepare the database

- Create the PostgreSQL database defined in `DB_DATABASE`
- Make sure the database user has permission to create and update tables
- Start Redis locally if you want BullMQ notifications to run

### 3. Run the backend

```bash
cd backend
npm run start:dev
```

Backend defaults to `http://localhost:5000`.

### 4. Run the frontend

```bash
cd frontend
npm run dev
```

Frontend defaults to `http://localhost:3000`.

## Available Scripts

### Backend

Located in `backend/package.json`:

- `npm run start:dev` - run NestJS in watch mode
- `npm run start` - run NestJS once in development mode
- `npm run start:prod` - run compiled production output from `dist/`
- `npm run build` - compile the backend
- `npm run lint` - lint backend code
- `npm run test` - run unit tests
- `npm run test:e2e` - run end-to-end tests
- `npm run test:cov` - run coverage
- `npm run seed` - run the database seeder

### Frontend

Located in `frontend/package.json`:

- `npm run dev` - run Next.js in development mode
- `npm run build` - build the frontend for production
- `npm run start` - start the production frontend server
- `npm run lint` - lint frontend code

## API Documentation

When the backend is running, Swagger is available at:

- `http://localhost:5000/api/docs`

## Production Build

### Backend build

```bash
cd backend
npm run build
npm run start:prod
```

The backend build output is written to `backend/dist`.

### Frontend build

```bash
cd frontend
npm run build
npm run start
```

## Deployment Instructions

### Option 1: Deploy backend on a VPS or container host

1. Provision PostgreSQL and Redis.
2. Set all backend environment variables.
3. Install dependencies in `backend/`.
4. Run `npm run build`.
5. Start the service with `npm run start:prod`.
6. Put the backend behind a reverse proxy such as Nginx.

### Option 2: Deploy frontend to Vercel or a Node host

1. Set `NEXT_PUBLIC_API_URL` to your deployed backend URL.
2. Install dependencies in `frontend/`.
3. Run `npm run build`.
4. Start with `npm run start`, or connect the repo to Vercel.

### Option 3: Docker deployment

If you deploy with Docker, use separate images for backend and frontend.

Backend image outline:

```dockerfile
FROM node:18-alpine AS builder
WORKDIR /app
COPY package*.json ./
RUN npm install
COPY . .
RUN npm run build

FROM node:18-alpine
WORKDIR /app
COPY package*.json ./
RUN npm install --production
COPY --from=builder /app/dist ./dist
EXPOSE 5000
CMD ["node", "dist/main.js"]
```

Frontend image outline:

```dockerfile
FROM node:18-alpine AS builder
WORKDIR /app
COPY package*.json ./
RUN npm install
COPY . .
RUN npm run build

FROM node:18-alpine
WORKDIR /app
COPY package*.json ./
RUN npm install --production
COPY --from=builder /app/.next ./.next
COPY --from=builder /app/public ./public
EXPOSE 3000
CMD ["npm", "run", "start"]
```

Recommended production services:

- PostgreSQL for the database
- Redis for BullMQ workers and notifications
- Nginx or a cloud load balancer in front of the backend
- S3 or R2 for file uploads in production

## Data and Storage Notes

- Equipment images and uploads can fall back to local `uploads/` storage when S3/R2 is not configured.
- BullMQ notifications require Redis.
- TypeORM is currently configured with `synchronize: true`, which is convenient for development but should be disabled in stricter production setups.

## Troubleshooting

- If the frontend cannot reach the backend, check `NEXT_PUBLIC_API_URL`.
- If uploads fail, verify the S3/R2 credentials or allow local storage fallback.
- If notifications do not run, confirm Redis is available on `REDIS_HOST` and `REDIS_PORT`.
- If the backend fails at startup after schema changes, delete stale build output and rebuild with `npm run build`.

## License

No license has been specified for this repository.
