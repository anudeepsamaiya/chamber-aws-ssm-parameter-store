/**
 * Jest configuration for integration tests
 */
const baseConfig = require('./jest.base.config');

module.exports = {
  ...baseConfig,
  clearMocks: false,  // Don't clear mocks for integration tests
  testMatch: ['**/tests/integration/**/*.test.js'],
  testTimeout: 30000,  // Longer timeout for integration tests
  globals: {
    // Environment flags for integration tests
    DOCKER_ENV: process.env.DOCKER_ENV || false,
    SKIP_AWS_TESTS: process.env.SKIP_AWS_TESTS || false
  }
};