/**
 * Jest configuration for unit tests
 */
const baseConfig = require('./jest.base.config');

module.exports = {
  ...baseConfig,
  testMatch: ['**/tests/unit/**/*.test.js'],
  collectCoverage: true,
  coverageDirectory: 'coverage'
};