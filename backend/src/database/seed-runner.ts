import { DataSource } from 'typeorm';
import { seedDatabase } from './seed';
import * as entities from '../entities';

const dataSource = new DataSource({
  type: 'sqlite',
  database: process.env.DATABASE_PATH || 'database.sqlite',
  entities: Object.values(entities),
  synchronize: true,
});

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

