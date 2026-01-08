# E-Commerce Backend

Node.js + TypeScript + Prisma + PostgreSQL Backend API

## Setup

1. Install dependencies:
```bash
npm install
```

2. Copy `.env.example` to `.env` and update values:
```bash
cp .env.example .env
```

3. Setup database:
```bash
npm run generate
npm run migrate
```

4. Run development server:
```bash
npm run dev
```

Backend runs on `http://localhost:3000`

## Project Structure

```
backend/
├── src/
│   ├── controllers/    # Route handlers
│   ├── services/        # Business logic
│   ├── routes/         # API routes
│   ├── middlewares/    # Express middlewares
│   ├── utils/          # Utility functions
│   ├── config/         # Configuration
│   └── prisma/         # Prisma schema
├── package.json
├── tsconfig.json
└── prisma.config.ts
```

## API Endpoints

See main README.md for API documentation.
