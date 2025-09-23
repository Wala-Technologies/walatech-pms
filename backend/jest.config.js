module.exports = {
  moduleFileExtensions: ['js', 'json', 'ts'],
  rootDir: 'src',
  testRegex: '.*\.spec\.ts$',
  transform: {
    '^.+\.(t|j)s$': 'ts-jest',
  },
  collectCoverageFrom: [
    '**/*.(t|j)s',
    '!**/*.spec.ts',
    '!**/*.e2e-spec.ts',
    '!**/node_modules/**',
    '!**/dist/**',
    '!**/coverage/**',
    '!**/*.interface.ts',
    '!**/*.dto.ts',
    '!**/main.ts',
    '!**/data-source.ts',
    '!**/migrations/**',
  ],
  coverageDirectory: '../coverage',
  testEnvironment: 'node',
  setupFilesAfterEnv: ['<rootDir>/test-setup.ts'],
  moduleNameMapping: {
    '^@/(.*)$': '<rootDir>/$1',
  },
  testTimeout: 30000,
  coverageReporters: ['text', 'lcov', 'html'],
  coverageThreshold: {
    global: {
      branches: 80,
      functions: 80,
      lines: 80,
      statements: 80,
    },
  },
};