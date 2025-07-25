import { drizzle } from 'drizzle-orm/node-postgres'
import { migrate } from 'drizzle-orm/node-postgres/migrator'
import pg from 'pg'
import { db, employees, inventory } from './db/index.js'

const { Pool } = pg

async function main() {
  console.log('Running migrations...')
  
  const pool = new Pool({
    connectionString: process.env.DATABASE_URL || 'postgresql://postgres:password@localhost:5432/ifixandrepair',
  })
  
  const migrationDb = drizzle(pool)
  
  await migrate(migrationDb, { migrationsFolder: './server/db/migrations' })
  
  console.log('Migrations completed successfully!')
  
  // Seed initial data
  console.log('Seeding initial data...')
  
  // Add default employees (Omar and AB)
  await db.insert(employees).values([
    {
      name: 'Omar',
      role: 'Technician',
      isActive: true,
    },
    {
      name: 'AB',
      role: 'Technician', 
      isActive: true,
    }
  ]).onConflictDoNothing()
  
  // Add basic Apple inventory items
  const appleProducts = [
    // iPhone models
    { brand: 'Apple', productLine: 'iPhone', model: 'iPhone 15 Pro Max', partType: 'Screen', quantity: 10, sellingPrice: '300.00' },
    { brand: 'Apple', productLine: 'iPhone', model: 'iPhone 15 Pro', partType: 'Screen', quantity: 8, sellingPrice: '280.00' },
    { brand: 'Apple', productLine: 'iPhone', model: 'iPhone 15 Plus', partType: 'Screen', quantity: 6, sellingPrice: '250.00' },
    { brand: 'Apple', productLine: 'iPhone', model: 'iPhone 15', partType: 'Screen', quantity: 12, sellingPrice: '220.00' },
    { brand: 'Apple', productLine: 'iPhone', model: 'iPhone 14 Pro Max', partType: 'Screen', quantity: 8, sellingPrice: '270.00' },
    { brand: 'Apple', productLine: 'iPhone', model: 'iPhone 14 Pro', partType: 'Screen', quantity: 10, sellingPrice: '250.00' },
    { brand: 'Apple', productLine: 'iPhone', model: 'iPhone 14 Plus', partType: 'Screen', quantity: 7, sellingPrice: '230.00' },
    { brand: 'Apple', productLine: 'iPhone', model: 'iPhone 14', partType: 'Screen', quantity: 15, sellingPrice: '200.00' },
    { brand: 'Apple', productLine: 'iPhone', model: 'iPhone 13 Pro Max', partType: 'Screen', quantity: 5, sellingPrice: '240.00' },
    { brand: 'Apple', productLine: 'iPhone', model: 'iPhone 13 Pro', partType: 'Screen', quantity: 8, sellingPrice: '220.00' },
    { brand: 'Apple', productLine: 'iPhone', model: 'iPhone 13', partType: 'Screen', quantity: 12, sellingPrice: '180.00' },
    { brand: 'Apple', productLine: 'iPhone', model: 'iPhone 12 Pro Max', partType: 'Screen', quantity: 4, sellingPrice: '210.00' },
    { brand: 'Apple', productLine: 'iPhone', model: 'iPhone 12 Pro', partType: 'Screen', quantity: 6, sellingPrice: '190.00' },
    { brand: 'Apple', productLine: 'iPhone', model: 'iPhone 12', partType: 'Screen', quantity: 10, sellingPrice: '160.00' },
    { brand: 'Apple', productLine: 'iPhone', model: 'iPhone 11 Pro Max', partType: 'Screen', quantity: 3, sellingPrice: '180.00' },
    { brand: 'Apple', productLine: 'iPhone', model: 'iPhone 11 Pro', partType: 'Screen', quantity: 5, sellingPrice: '160.00' },
    { brand: 'Apple', productLine: 'iPhone', model: 'iPhone 11', partType: 'Screen', quantity: 8, sellingPrice: '140.00' },
    { brand: 'Apple', productLine: 'iPhone', model: 'iPhone XS Max', partType: 'Screen', quantity: 2, sellingPrice: '150.00' },
    { brand: 'Apple', productLine: 'iPhone', model: 'iPhone XS', partType: 'Screen', quantity: 3, sellingPrice: '130.00' },
    { brand: 'Apple', productLine: 'iPhone', model: 'iPhone XR', partType: 'Screen', quantity: 6, sellingPrice: '120.00' },
    
    // iPad models
    { brand: 'Apple', productLine: 'iPad', model: 'iPad Pro 12.9" (6th gen)', partType: 'Screen', quantity: 2, sellingPrice: '400.00' },
    { brand: 'Apple', productLine: 'iPad', model: 'iPad Pro 11" (4th gen)', partType: 'Screen', quantity: 3, sellingPrice: '350.00' },
    { brand: 'Apple', productLine: 'iPad', model: 'iPad Air (5th gen)', partType: 'Screen', quantity: 4, sellingPrice: '300.00' },
    { brand: 'Apple', productLine: 'iPad', model: 'iPad (10th gen)', partType: 'Screen', quantity: 5, sellingPrice: '250.00' },
    { brand: 'Apple', productLine: 'iPad', model: 'iPad mini (6th gen)', partType: 'Screen', quantity: 3, sellingPrice: '280.00' },
  ]
  
  await db.insert(inventory).values(appleProducts).onConflictDoNothing()
  
  console.log('Initial data seeded successfully!')
  
  await pool.end()
  process.exit(0)
}

main().catch((error) => {
  console.error('Migration failed:', error)
  process.exit(1)
})