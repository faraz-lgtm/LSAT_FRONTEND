module.exports = {
  preset: 'ts-jest',
  testEnvironment: 'node',
  roots: ['<rootDir>/src/test'],
  testMatch: ['**/*.test.ts'],
  moduleNameMapper: {
    '^@/(.*)$': '<rootDir>/src/$1',
  },
  setupFilesAfterEnv: ['<rootDir>/src/test/setup.ts'],
  collectCoverageFrom: [
    'src/test/**/*.ts',
    '!src/test/**/*.d.ts',
  ],
  transform: {
    '^.+\\.ts$': ['ts-jest', {
      tsconfig: {
        jsx: 'react',
        esModuleInterop: true,
        module: 'esnext',
        target: 'es2020',
        moduleResolution: 'node',
        allowSyntheticDefaultImports: true,
        skipLibCheck: true,
      },
    }],
  },
  // Debug configuration
  silent: true,
  verbose: false,
  forceExit: true,
  detectOpenHandles: false,
  // Enable console output
  setupFilesAfterEnv: ['<rootDir>/src/test/setup.ts'],
  // Don't suppress console logs
  restoreMocks: true,
  clearMocks: true,
};