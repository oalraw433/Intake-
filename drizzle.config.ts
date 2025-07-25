import type { Config } from 'drizzle-kit'

export default {
  schema: './server/db/schema.ts',
  out: './server/db/migrations',
  driver: 'pg',
  dbCredentials: {
    connectionString: process.env.DATABASE_URL || 'postgresql://postgres:password@localhost:5432/ifixandrepair',
  },
} satisfies Config