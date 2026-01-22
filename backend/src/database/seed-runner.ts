import { DataSource } from 'typeorm';
import { seedDatabase } from './seed';
import * as entities from '../entities';

const databaseUrl = process.env.DATABASE_URL;

const dataSource = new DataSource(
  databaseUrl
    ? {
        type: 'postgres',
        url: databaseUrl,
        entities: Object.values(entities),
        synchronize: true,
        ssl: process.env.DB_SSL === 'true' ? { rejectUnauthorized: false } : false,
      }
    : {
        type: 'postgres',
        host: process.env.DB_HOST || 'localhost',
        port: parseInt(process.env.DB_PORT || '5432', 10),
        username: process.env.DB_USERNAME || 'postgres',
        password: process.env.DB_PASSWORD || 'postgres',
        database: process.env.DB_NAME || 'product_website',
        entities: Object.values(entities),
        synchronize: true,
        ssl: process.env.DB_SSL === 'true' ? { rejectUnauthorized: false } : false,
      },
);

async function run() {
  try {
    await dataSource.initialize();
    console.log('📦 Database connected');
    await seedDatabase(dataSource);
    console.log('✅ Seeding completed');
    await dataSource.destroy();
  } catch (error) {
    console.error('❌ Seeding failed:', error);
    process.exit(1);
  }
}

run();

