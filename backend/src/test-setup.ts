import { DataSource } from 'typeorm';
import { ConfigService } from '@nestjs/config';

// Global test setup
beforeAll(async () => {
  // Set test environment variables
  process.env.NODE_ENV = 'test';
  process.env.DB_HOST = process.env.TEST_DB_HOST || 'localhost';
  process.env.DB_PORT = process.env.TEST_DB_PORT || '3306';
  process.env.DB_USERNAME = process.env.TEST_DB_USERNAME || 'test';
  process.env.DB_PASSWORD = process.env.TEST_DB_PASSWORD || 'test';
  process.env.DB_DATABASE = process.env.TEST_DB_DATABASE || 'walatech_pms_test';
  process.env.JWT_SECRET = process.env.TEST_JWT_SECRET || 'test-secret-key';
});

// Global test teardown
afterAll(async () => {
  // Clean up any global resources
});

// Mock console methods to reduce noise in tests
global.console = {
  ...console,
  log: jest.fn(),
  debug: jest.fn(),
  info: jest.fn(),
  warn: jest.fn(),
  error: jest.fn(),
};

// Increase timeout for database operations
jest.setTimeout(30000);