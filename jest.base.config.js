/**
 * Base Jest configuration for all test types
 */
module.exports = {
  clearMocks: true,
  moduleFileExtensions: ['js', 'json'],
  testEnvironment: 'node',
  transform: {},
  verbose: true,
  coverageReporters: ['text', 'lcov'],
  coveragePathIgnorePatterns: ['/node_modules/']
};