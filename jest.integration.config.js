/**
 * Jest configuration for integration tests
 *
 * This configuration is used specifically for integration tests that interact
 * with external services like AWS SSM Parameter Store (via LocalStack).
 */
module.exports = {
  clearMocks: false,     // Don't clear mocks between tests to maintain LocalStack state
  moduleFileExtensions: ['js', 'json'],  // File extensions to be treated as modules
  testMatch: ['**/tests/integration/**/*.test.js'],  // Only run files in the integration directory
  testEnvironment: 'node',  // Run tests in Node.js environment
  transform: {},  // No transformations needed for plain JS
  verbose: true,  // Show detailed test output
  testTimeout: 30000,  // Longer timeout for integration tests (30 seconds)
};