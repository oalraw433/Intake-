import { drizzle } from 'drizzle-orm/node-postgres'
import pg from 'pg'
import * as schema from './schema.js'

const { Pool } = pg

const pool = new Pool({
  connectionString: process.env.DATABASE_URL || 'postgresql://postgres:password@localhost:5432/ifixandrepair',
})

export const db = drizzle(pool, { schema })

export * from './schema.js'