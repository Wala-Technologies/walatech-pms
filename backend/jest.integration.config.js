module.exports = {
  moduleFileExtensions: ['js', 'json', 'ts'],
  rootDir: 'src',
  testRegex: '.*\.integration\.spec\.ts$',
  transform: {
    '^.+\.(t|j)s$': 'ts-jest',
  },
  collectCoverageFrom: [
    '**/*.(t|j)s',
    '!**/*.spec.ts',
    '!**/*.integration.spec.ts',
    '!**/*.e2e-spec.ts',
    '!**/node_modules/**',
    '!**/dist/**',
    '!**/coverage/**',
    '!**/*.interface.ts',
    '!**/*.dto.ts',
    '!**/main.ts',
    '!**/data-source.ts',
    '!**/migrations/**',
    '!**/test/**',
  ],
  coverageDirectory: '../coverage-integration',
  testEnvironment: 'node',
  setupFilesAfterEnv: ['<rootDir>/test-setup.ts'],
  moduleNameMapper: {
    '^@/(.*)$': '<rootDir>/$1',
  },
  testTimeout: 60000, // Longer timeout for database operations
  coverageReporters: ['text', 'lcov', 'html'],
  maxWorkers: 1, // Run integration tests sequentially to avoid database conflicts
};