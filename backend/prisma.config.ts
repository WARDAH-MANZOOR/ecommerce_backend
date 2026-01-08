// src/prisma/config.ts
import "dotenv/config"; // loads .env automatically
import { defineConfig } from "prisma/config";

// Runtime check: ensure DATABASE_URL exists
const databaseUrl = process.env.DATABASE_URL;

if (!databaseUrl) {
  throw new Error(
    "❌ DATABASE_URL is not defined in your .env file. Please add it."
  );
}

export default defineConfig({
  schema: "src/prisma/schema.prisma",
  migrations: {
    path: "src/prisma/migrations",
  },
  datasource: {
    url: databaseUrl, // now TypeScript knows this is a string
  },
});
