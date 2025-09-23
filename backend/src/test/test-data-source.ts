import { config } from 'dotenv';
import { DataSource } from 'typeorm';
import { TestTenant } from './entities/tenant.test.entity';
import { TestGLEntry } from './entities/gl-entry.test.entity';

// Load test environment variables
config({ path: '.env.test' });

export const TestDataSource = new DataSource({
  type: 'sqlite',
  database: ':memory:', // Use in-memory SQLite for tests
  synchronize: true, // Auto-create tables for tests
  logging: false, // Disable logging for cleaner test output
  dropSchema: true, // Drop schema before each test run
  entities: [
    TestTenant,
    TestGLEntry,
  ],
  migrations: [],
  subscribers: [],
  extra: {
    // Disable foreign key constraints for SQLite
    pragma: {
      foreign_keys: 'OFF',
    },
  },
});